# Pricing Model (Multi-Tenant)

This document outlines the pricing approach aligned with our architecture: users can belong to multiple organizations, and subscriptions are scoped per-organization.

## Principles
- Per-organization subscription: each organization (tenant) has its own plan and billing owner.
- Fair, education-friendly options: support school SSO and flexible seat models.
- Start simple, grow with usage: clear free/trial, predictable base tiers, and optional add-ons.

## Core Tiers (per Organization)
- Assisted Trial (30 days)
  - Seats: up to 120 members during trial
  - Full Pro feature access to demonstrate value
  - White‑glove onboarding and consultation included
- Starter
  - Seats included: 30; additional seats metered or upgrade to Pro
  - Core features + email support
- Pro
  - Seats included: 120; additional seats metered
  - Advanced features, priority support
  - SSO add-on eligible (Google/Microsoft/SAML)
- Enterprise (Quote)
  - Unlimited seats or custom caps
  - All features + SSO included, SLAs, onboarding, invoicing

Notes
- Seats = active members in the organization (owner/admin/member). Service accounts excluded.
- Storage/feature thresholds can be tuned per tier.

## Add-ons (per Organization)
- Extra Seats (pack or per-seat)
- Extra Storage
- SSO for Pro (if not included)
- Rostering/SCIM (education)

## Billing Model
- Subscription tied to `orgId` (not the user)
- Billing contact defaults to org owner; can be reassigned to billing admin
- Billing frequency: monthly or annual (discount)
- Invoices and payment method managed in the Account Hub under `/account/subscriptions` with org selection

## Metering
- Seat Count: count unique active members per billing period; prorate mid-cycle if supported by provider
- Usage Quotas: requests, storage, or feature gates per plan; overages billed as add-ons
- Grace Periods: configurable grace for past_due before limiting access

## Education-Focused SSO and Discounts
- EDU SSO options available per org: Google Workspace, Microsoft Entra ID, or SAML (Okta/ADFS/ClassLink/Clever)
- Discount policy: EDU verification required (domain verification or documentation)
- Bundles: site licenses for districts/schools (Enterprise); campus-wide pricing

## Pricing Surfaces in the Product
- Marketing site `/pricing` (public): plan comparison, EDU notes, contact sales for Enterprise
- Account Hub `/organizations/new`: choose Assisted Trial (no payment) or pick a paid plan
- Account Hub `/account/subscriptions`: manage plan, view invoices, change billing cycle
- Dashboard Shell (informational only): if org hits limits, show upgrade prompts linking back to Account Hub

## Flows
- Assisted Trial
  - Create Organization → choose Assisted Trial → schedule onboarding → provision trial tenant → redirect to `https://{orgslug}.app.baseurl/`
  - Conversion at day 21/28 prompts → select plan → checkout → subscription provisioned
- Direct Purchase
  - Create Organization → choose plan → checkout → provision subscription → redirect to `https://{orgslug}.app.baseurl/`
- Upgrade/Downgrade
  - From `/account/subscriptions` choose target plan → checkout/portal → subscription updated
- Add seats/add-ons
  - From `/account/subscriptions` → change quantity or add packs

## Data Model Touchpoints
- `subscriptions`: `{ orgId, planId, status, provider, currentPeriodEnd, customerId }`
- `organizations`: org billing owner/admin references
- `invoices` (optional mirror): store key fields for quick UI; source of truth is payment provider

## Policies
- Trials: 30 days by default (configurable); notify owners before expiration; on expiration require conversion or restrict to limited access
- Refunds: follow provider capability; pro-rate where possible
- Overdue: restrict premium features after grace; never lock out owners from billing access

## Implementation Notes
- Payment provider integration lives in Landing (`@zana/payments`)
- Webhooks update `subscriptions` and related metadata; idempotency required
- Plan and pricing tables should be config-driven to allow updates without deploy

## Open Questions
- Do we prefer per-seat metering or buckets per tier for education customers?
- Should Free allow enabling SSO for pilot schools?
- Do we support purchase orders/invoicing for Enterprise in phase one?

---

## Kenya Market Details (KES)

Currency and taxes
- Pricing displayed in KES; VAT 16% applied where applicable.
- Annual plans discounted ~15% vs monthly (inclusive of local tax treatment where applicable).

Indicative prices (per Organization)
- Assisted Trial (30 days): KES 0 for 30 days; includes up to 120 seats, white‑glove onboarding, and consultation (see below).
- Starter: KES 5,000 / month (30 seats included); extra seats KES 300 / seat / month.
- Pro: KES 22,500 / month (120 seats included); extra seats KES 150 / seat / month.
- Enterprise: custom quote (site license/volume tiers) — annual invoicing available.

Education discounts
- Verified K-12/TVET/Higher-Ed institutions: 30–50% EDU discount on Starter/Pro.
- Site license bundles for districts/campuses; multi-school deployments under Enterprise.

Payment methods
- M‑Pesa (STK push) via Pesapal or direct integration.
- Cards (Visa/Mastercard) via Pesapal.
- Bank transfer/P.O. for Enterprise (manual invoicing and reconciliation).

Operational notes
- Retry and grace periods should consider M‑Pesa downtime; allow manual payment confirmation.
- Receipts and ETR/VAT-compliant invoices emailed to billing contact.
- Localized `/pricing` page should surface KES amounts and EDU eligibility.

### Assisted Onboarding Program (Kenya)

Purpose
- Maximize activation in the first 30 days through human‑led onboarding and quick access.

What’s included (at no cost during trial)
- Priority setup call within 24 hours (Mon–Fri) to configure org, domains, and HRD discovery.
- Tenant provisioning checklist: org creation, slug, domains, and SSO discovery mapping.
- Data onboarding help: CSV/Spreadsheet import assistance for users/classes (where applicable).
- Three live training sessions (admin, teacher/staff, reporting) – recorded and shared.
- WhatsApp and phone support (7am–7pm EAT) during the trial; email support after‑hours.
- Success review at day 21 with adoption metrics and go‑live plan.

Trial scope
- Seats: up to 120 members included for the 30‑day trial to remove friction.
- Features: full Pro feature set during trial to demonstrate value.
- No payment required to start; billing set up only on conversion.

Conversion options (after 30 days)
- Starter: for small teams; seat limit returns to tier defaults; add seats as needed.
- Pro: recommended for schools; continue priority support for the first 90 days after conversion.
- Enterprise: site license with ongoing dedicated CSM, on‑site training available.

Sales & Success motions
- Prominent “Book onboarding” CTA on `/pricing` and `/organizations/new`.
- SDR reach‑out within 24 hours for assisted trial sign‑ups.
- CSM assigned for schools/districts; shared success mailbox/WhatsApp channel.

Product surfaces
- `/pricing`: assisted trial card with "+50 seats for 30 days" and "Book onboarding" button.
- `/organizations/new`: option to start Assisted Trial; collect minimal fields and schedule call.
- `/account/subscriptions`: conversion prompts at days 21/28 with plan suggestions.

Kenya-specific add‑ons
- Teacher Pack (30 seats): KES 4,500 / month (priced at KES 150/seat)
- Extra Storage: KES 1,500 / 100GB / month (indicative)
