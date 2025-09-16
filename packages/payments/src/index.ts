// Payments package: exposes providers and helper types

export type ProviderName = "mobile_money" | "card" | "paypal";

export type MandateResult = { simulated: boolean; mandateId?: string; hostedUrl?: string };
export type ChargeResult = { simulated: boolean; status: "SUCCESS" | "FAILED"; error?: string };

export interface PaymentProvider {
	name: ProviderName;
	initiateMandate(params: { email: string; phone?: string; planId: string; billing: "monthly" | "yearly"; locale?: string }): Promise<MandateResult>;
	charge(params: { mandateId: string; amount: number; reference: string }): Promise<ChargeResult>;
}

// Deterministic account reference for providers that support it (e.g., Pesapal)
export function makeAccountNumber(email: string, planId: string, billing: "monthly" | "yearly") {
	const base = `${email.toLowerCase()}|${planId}|${billing}`;
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const crypto = require("crypto");
	const hash = crypto.createHash("sha256").update(base).digest("hex").slice(0, 8);
	return `acct_${planId}_${billing}_${hash}`;
}

// --- Pesapal (East Africa – hosted checkout) ---
export const PesapalProvider: PaymentProvider = {
	name: "mobile_money",
	async initiateMandate({ email, planId, billing, locale, phone }) {
		const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
		const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
		const env = (process.env.PESAPAL_ENV || "sandbox").toLowerCase();
		if (!consumerKey || !consumerSecret) throw new Error("Pesapal not configured: missing consumer key/secret");
		const base = process.env.PESAPAL_BASE_URL || (env === "live" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3");

		// 1) Auth token
		const tokenResp = await fetch(`${base}/api/Auth/RequestToken`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
		});
		if (!tokenResp.ok) {
			const text = await tokenResp.text();
			throw new Error(`Pesapal token error (${tokenResp.status}): ${text}`);
		}
		const tokenJson = await tokenResp.json();
		const accessToken = tokenJson?.token || tokenJson?.access_token;
		if (!accessToken) throw new Error(`Pesapal token missing in response: ${JSON.stringify(tokenJson)}`);

		// 2) Amount from pricing
		const { computePlanAmounts } = await import("./pricing.js");
		const amounts = computePlanAmounts(planId as any, billing);
		const amountKES = billing === "monthly" ? amounts.monthlyKES : amounts.yearlyKES;
		const pubBase = process.env.PUBLIC_BASE_URL || "http://localhost:3000";
		const localePrefix = locale && (locale === "en" || locale === "sw") ? `/${locale}` : "";
		const callback = process.env.PESAPAL_CALLBACK_URL || `${pubBase}${localePrefix}/payments/success`;

		const frequency = billing === "monthly" ? "MONTHLY" : "YEARLY";
		const now = new Date();
		const start = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
		const endDate = new Date(now);
		// default: one-year validity; providers may interpret differently
		endDate.setFullYear(endDate.getFullYear() + 1);
		const end = `${String(endDate.getDate()).padStart(2, "0")}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${endDate.getFullYear()}`;

		const account_number = makeAccountNumber(email, planId, billing);
		const notificationId = (process.env.PESAPAL_NOTIFICATION_ID || "").trim();
		if (!notificationId) {
			throw new Error(
				"Pesapal recurring orders require PESAPAL_NOTIFICATION_ID. Register an IPN URL in the Pesapal dashboard (point it to your /api/webhooks/pesapal), copy the Notification ID, set PESAPAL_NOTIFICATION_ID, then restart the server."
			);
		}
		const order: any = {
			id: `order_${Date.now()}`,
			currency: "KES",
			amount: amountKES || 100,
			description: `Zana ${planId} ${billing}`,
			callback_url: callback,
			notification_id: notificationId,
			billing_address: {
				email_address: email,
				phone_number: phone,
				country_code: "KE",
				first_name: email.split("@")[0],
				last_name: "",
			},
			account_number,
			subscription_details: {
				start_date: start,
				end_date: end,
				frequency,
			},
		};

		const orderResp = await fetch(`${base}/api/Transactions/SubmitOrderRequest`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
			body: JSON.stringify(order),
		});
		const orderText = await orderResp.text();
		let orderJson: any = null;
		try {
			orderJson = JSON.parse(orderText);
		} catch {}
		const link = orderJson?.redirect_url || orderJson?.data?.redirect_url;
		if (orderResp.ok && link) return { simulated: false, hostedUrl: link };
		throw new Error(`Pesapal order error: ${orderResp.status} ${orderText}`);
	},
	async charge() {
		// Typically handled by Pesapal recurring billing; use webhook to confirm
		return { simulated: true, status: "SUCCESS" } as const;
	},
};

// --- PayPal provider (subscription via hosted flow) ---
export const PayPalProvider: PaymentProvider = {
	name: "paypal",
	async initiateMandate({ email, planId, billing, locale }) {
		try {
			const clientId = process.env.PAYPAL_CLIENT_ID;
			const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
			const planMap: Record<string, string | undefined> = {
				standard: process.env.PAYPAL_PLAN_STANDARD,
				pro: process.env.PAYPAL_PLAN_PRO,
				org: process.env.PAYPAL_PLAN_ORG,
			};
			const ppPlanId = planMap[planId];
			if (clientId && clientSecret && ppPlanId) {
				// Lazy require to avoid bundling in client
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const paypal = require("@paypal/checkout-server-sdk");
				const env = process.env.PAYPAL_ENV === "live"
					? new paypal.core.LiveEnvironment(clientId, clientSecret)
					: new paypal.core.SandboxEnvironment(clientId, clientSecret);
				const client = new paypal.core.PayPalHttpClient(env);

				// Create a subscription
				const req = new paypal.subscriptions.SubscriptionsCreateRequest();
				req.requestBody({
					plan_id: ppPlanId,
					subscriber: { email_address: email },
					application_context: {
						return_url: `${process.env.PUBLIC_BASE_URL || "http://localhost:3000"}${locale && (locale === "en" || locale === "sw") ? `/${locale}` : ""}/payments/success`,
						cancel_url: `${process.env.PUBLIC_BASE_URL || "http://localhost:3000"}${locale && (locale === "en" || locale === "sw") ? `/${locale}` : ""}/payments/canceled`,
						brand_name: process.env.PUBLIC_BRAND || "Zana",
						locale: (locale || "en").toUpperCase(),
						shipping_preference: "NO_SHIPPING",
						user_action: "SUBSCRIBE_NOW",
					},
				});
				const resp = await client.execute(req);
				const approve = resp?.result?.links?.find((l: any) => l.rel === "approve")?.href;
				if (approve) return { simulated: false, hostedUrl: approve } as const;
			}
		} catch (e) {
			// ignore and fall back to simulated
		}
		return { simulated: true, hostedUrl: "#" } as const;
	},
	async charge() {
		// Typically not used directly; PayPal handles recurring charges
		return { simulated: true, status: "SUCCESS" } as const;
	},
};

export function getProvider(name: ProviderName): PaymentProvider {
	switch (name) {
		case "mobile_money":
			return PesapalProvider;
		case "paypal":
			return PayPalProvider;
		default:
			return PesapalProvider;
	}
}

export { computePlanAmounts, getPlanById, BASE_PLANS, type PlanId } from "./pricing.js";
export { PayPalButton } from "./react/PayPalButton.js";
export { PesapalButton } from "./react/PesapalButton.js";
