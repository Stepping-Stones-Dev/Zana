import DefaultLayout from "@/layouts/default";

export default function PrivacyPage() {
  return (
    <DefaultLayout>
      <main className="px-6 sm:px-10 py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Privacy & Data Use</h1>
        <p className="text-default-600 mb-6">
          We collect and process limited personal data to provide subscription management and billing services.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">What we collect</h2>
          <ul className="list-disc ml-6 text-default-600">
            <li>Email address for account and billing communication.</li>
            <li>Phone number for mobile money mandates and billing.</li>
            <li>Subscription details: plan, billing cycle, provider, status, and mandate identifiers.</li>
            <li>Charge logs: subscription id, amount, provider, status, and timestamps.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">What we do not store</h2>
          <ul className="list-disc ml-6 text-default-600">
            <li>We do not store card PAN, CVC, or PayPal passwords/tokens.</li>
            <li>We do not store provider API secrets in logs or client code.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">How we use your data</h2>
          <p className="text-default-600">
            Data is used strictly to manage your subscription, set up mandates with your chosen provider, and process recurring charges.
            We may contact you about billing issues or important account notices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Retention</h2>
          <p className="text-default-600">
            We retain subscription records while your subscription is active. Failed charge logs may be retained for up to 180 days for
            troubleshooting and compliance, after which they may be purged.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Security</h2>
          <p className="text-default-600">
            We use provider-side tokenization for mandates and charges. We apply least-privilege Firestore rules and avoid broad reads.
            API secrets are stored as environment variables on the server only.
          </p>
        </section>
      </main>
    </DefaultLayout>
  );
}
