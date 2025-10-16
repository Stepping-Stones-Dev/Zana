<div align="center">
<h1>@zana/ui</h1>
<p><strong>Composite application surfaces for the Zana platform</strong><br/>Higher‑order, accessibility‑first UI structures (dashboard header, side navigation, app switcher, card grids, list/list sections) powered by CSS tokens, instant theming, runtime i18n, instrumentation & onboarding hooks.</p>
<p>
	<em>No reinvention of primitive buttons or inputs — those come from the Heroui CDN. This package focuses on opinionated, product‑level composition.</em>
</p>
</div>

---

## Table of Contents
1. Vision & Principles
2. Architectural Overview
3. External Dependency: Heroui CDN
4. Design Tokens & Theming
5. Internationalization (Instant No‑Reload Switching)
6. Composite Component Catalog (Status)
7. Implemented Component API Reference
8. Analytics & Instrumentation Framework
9. Tutorialisation / Guided Journeys Strategy
10. Capability & Access Control Integration
11. Performance, Accessibility & Quality Budgets
12. Security, Privacy & Compliance Considerations
13. Extensibility Patterns & Adding New Surfaces
14. Testing Strategy & Layered QA
15. Migration Guidance
16. Versioning & Stability Policy
17. Roadmap (Phased)
18. Contribution Workflow & PR Checklist
19. FAQ / Troubleshooting
20. License

---

## 1. Vision & Principles
We deliver structural UI surfaces that encode recurring product patterns so downstream teams ship faster with **consistency, instrumentation readiness, and minimal runtime cost**.

| Principle | Why It Matters | Implementation Expression |
|-----------|----------------|---------------------------|
| Composition over primitives | Avoid design debt & divergence | Rely on Heroui primitives + thin wrappers only when semantics differ |
| Zero (or near‑zero) runtime overhead | Keep bundle slim & TTI fast | Pure functions, no global singletons besides small contexts (theme/i18n) |
| Observability by construction | Product growth & adoption analysis | Stable data attributes + future `useInstrumentation` hook |
| Progressive enhancement | Core HTML still meaningful | Semantic landmarks (`nav`, `header`, `ul`, `h1`) |
| Accessibility first | Reduced retrofitting risk | ARIA roles, keyboard ordering, visual hidden utilities |
| Deterministic theming | Predictable theming & SSR friendly | CSS Custom Properties + `data-theme` attribute toggling |
| Incremental internationalization | Avoid blocking initial adoption | Lightweight runtime dictionary merge + optional lazy future |
| Capability awareness | Prevent leaking restricted UI | Consumer filters before render; planned CapabilityGuard wrapper |

---

## 2. Architectural Overview
```
 App (Consumer)
	 ├── <I18nProvider> (runtime dictionaries, instant switching)
	 ├── Theme layer (data-theme, tokens.css)
	 └── Composite Surfaces from @zana/ui
					 ├── DashboardHeader
					 ├── SideBar
					 ├── AppSwitcher
					 ├── CardDisplay
					 ├── ReorderableList (experimental)
					 └── ListSectionHeader / ListSectionFooter

 Observability (future): useInstrumentation → @zana/telemetry
 Capability Gating (future): <CapabilityGuard> wrapper / static util
 Tutorial Engine (future): uses data-tour / data-analytics-* anchors
```

Key Modules:
- tokens: Source of semantic design tokens (exported object + CSS variables).
- theme: Helpers `applyTheme`, `toggleTheme`, and color scheme preference hooks.
- i18n: Minimal provider + hooks for instant language switching.
- components: Composite surfaces (and temporary primitive placeholders slated for removal).
- internal: Utilities like `cx` merging classes.

---

## 3. External Dependency: Heroui CDN
Load once globally (HTML `<head>`). Pin versions & integrity:
```html
<link rel="stylesheet" href="https://cdn.heroui.dev/v1.4.0/theme.css" integrity="sha256-<PINNED-HASH>" crossorigin="anonymous" />
<script defer src="https://cdn.heroui.dev/v1.4.0/components.min.js" integrity="sha256-<PINNED-HASH>" crossorigin="anonymous"></script>
```
Governance:
- Maintain a version allowlist & CSP entry.
- Keep previous tag for 1 release cycle to permit rollback.
- Introduce upgrade checklist (visual diff, a11y audit, bundle delta).

---

## 4. Design Tokens & Theming
Tokens are exported JS (for programmatic use) and realized as CSS custom properties (for runtime adaptation). Light/Dark toggle flips a root attribute `data-theme` with no React re-renders required.

Example override layering:
```css
:root { --color-accent: #4f46e5; --radius-sm: 4px; }
[data-theme='dark'] { --color-accent: #6366f1; }
```
Runtime helpers:
```ts
import { applyTheme, toggleTheme } from '@zana/ui';
applyTheme('dark');
toggleTheme();
```
Advanced Patterns:
- Persist chosen theme in localStorage; hydrate early to avoid Flash Of Inconsistent Theme (FOIT).
- Offer “Follow System” mode: store `mode = system` separately from resolved theme.
- Multi-density (future): tokens scoped by `data-density` (comfortable / compact).

### 4.1 Color Scheme Hooks
- `usePreferredColorScheme()` – reads user OS preference (dark/light).
- `useAutoApplyPreferredColorScheme()` – opt-in auto-sync with OS changes.

---

## 5. Internationalization (Instant No‑Reload Switching)
The runtime i18n layer offers immediate dictionary swap with minimal surface area.

Core exports:
- `I18nProvider`
- `useI18n` (full object: `lang`, `setLang`, `t`, `has`, `available`)
- `useTranslate` (shorthand for `t`)
- `useLanguage` (just language state & setter)
- `createI18nConfig(namespace, languages, parts)` for merging dictionaries safely.

Design decisions:
| Aspect | Choice | Rationale |
|--------|--------|-----------|
| Storage | localStorage (configurable key) | Persistence across sessions |
| Fallback | Primary language then raw key | Developer visibility for missing translation |
| Interpolation | `{token}` simple replace | Low overhead; can be extended |
| Pluralization | Not built‑in (future) | Avoid complexity until needed |
| Lazy Loading | Deferred (future) | First iteration keeps runtime simple |

SSR: Provide `initial` prop derived from cookie / Accept-Language to prevent mismatch.

---

## 6. Composite Component Catalog (Status)
(Legend: ✅ implemented  🧪 experimental  🔜 planned  ⏳ backlog)
The catalog remains largely consistent with prior iteration; see below for API specifics.

### 6.1 Dashboard & Workspace
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `DashboardHeader` | ✅ | Page-level header (title/subtitle/actions/footer slot) | Tutorial anchor friendly |
| `SideBar` | ✅ | Collapsible vertical nav | Consumer supplies active + filtering |
| `AppSwitcher` | ✅ | App grid (enabled + upsell) | Feed from registry |
| `CardDisplay` | ✅ | Responsive card grid wrapper | CSS variable controlled |
| `ReorderableList` | 🧪 | Ordered list scaffold | Future DnD (dnd‑kit) |
| `ListSectionHeader` | ✅ | Section heading region | Data anchors |
| `ListSectionFooter` | ✅ | Section meta region | Counts / summaries |
| `KPIBar` | 🔜 | KPI metrics row | Tokenized layout |
| `FilterToolbar` | 🔜 | Filter/query chip bar | Integrates search |
| `Breadcrumbs` | 🔜 | Navigation trail | Overflow collapse |
| `InlineEmptyState` | 🔜 | Lightweight zero data notice | Action slot |
| `TabbedContentSwitcher` | 🔜 | Controlled tabs shell | URL sync by consumer |
| `ActivityFeedList` | ⏳ | Event feed shell | Virtualization future |
| `NotificationCenterPanel` | ⏳ | Notification drawer | Grouping logic |
| `GlobalSearchBar` | ⏳ | Unified search/command | Provider slots |
| `AppAnnouncementBanner` | ⏳ | Dismissible banner | Persist dismissal |
| `CapabilityGuard` | ⏳ | Capability gating wrapper | Hides/inerts children |

### 6.2 Account Management
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `ProfileOverviewPanel` | 🔜 | User profile summary | Identity module |
| `BillingSummaryCard` | 🔜 | Plan + renewal | Pricing metadata |
| `SubscriptionPlanSelector` | 🔜 | Plan compare matrix | Capability diffs |
| `PaymentMethodList` | ⏳ | Manage payment methods | Tokenized vault |
| `InvoicesTable` | ⏳ | Invoice history | Export slot |
| `UsageQuotaBar` | 🔜 | Quota progress | Threshold events |
| `TeamMembersList` | 🔜 | Members + roles | Capability gating |
| `InvitationManager` | 🔜 | Pending invites | API integration |
| `OwnershipTransferPanel` | ⏳ | Transfer flow | Multi-step |

### 6.3 Authentication & Identity
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `AuthLayout` | 🔜 | Branded auth page shell | Consistent scaffolding |
| `SignInHeader` | 🔜 | Heading + disclaimers | Branding tokens |
| `IdentityProviderPanel` | 🔜 | OIDC provider group | Policy aware |
| `OrgSwitcherModal` | 🔜 | Multi-org selection | Membership data |
| `PasswordlessMagicLinkStatus` | ⏳ | Magic link progress | Polling states |
| `SessionExpiryPrompt` | ⏳ | Renewal countdown | Silent refresh |
| `JourneyDecisionDebugPanel` | ⏳ | Debug journey classification | Dev only |

### 6.4 Marketing & Public
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `HeroSection` | 🔜 | Marketing hero | CTA + art slot |
| `FeatureGrid` | 🔜 | Features grid | Responsive columns |
| `TestimonialCarousel` | ⏳ | Customer quotes | Reduced motion respect |
| `PricingTable` | 🔜 | Plan tiers compare | Highlight recommended |
| `CTASection` | 🔜 | Persistent CTA banner | A/B friendly |
| `FooterNavBar` | 🔜 | Site footer | Collapsible mobile |
| `LogoCloud` | ⏳ | Logos strip | Accessible list |
| `NewsletterSignup` | ⏳ | Email capture | Consent flags |

### 6.5 Utilities & Accessibility
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `VisuallyHidden` | ✅ | Off-screen accessible text | Utility only |
| `SkeletonWrapper` | ⏳ | Skeleton state wrapper | Theme aware |
| `FocusScopeBoundary` | ⏳ | Focus trapping/scope | Overlays/dialogs |

Primitives (`Button`, `TextField`) remain TEMPORARY: they will be deprecated once all consumers lean on the CDN primitives directly.

---

## 7. Implemented Component API Reference
Only currently shipped components are documented here. Planned ones will gain API once stabilized.

### 7.1 DashboardHeader
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `React.ReactNode` | ✔ | Primary heading (rendered in `<h1>`) |
| `subtitle` | `React.ReactNode` | ✖ | Secondary line below title |
| `actions` | `React.ReactNode` | ✖ | Right-aligned actions region |
| `footerSlot` | `React.ReactNode` | ✖ | Area beneath header for tabs/filters |
| `className` | `string` | ✖ | Extra classes |
| `...data-*` | `any` | ✖ | Passed through for analytics/tutorialisation |

### 7.2 SideBar
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `{ key: string; label: React.ReactNode; icon?: React.ReactNode; badge?: React.ReactNode; disabled?: boolean; }[]` | ✔ | Nav entries |
| `activeKey` | `string` | ✖ | Active item key |
| `onSelect` | `(key: string) => void` | ✖ | Selection handler |
| `collapsible` | `boolean` | ✖ (default true) | Whether collapse toggle is shown |
| `initialCollapsed` | `boolean` | ✖ | Starting collapsed state |
| `className` | `string` | ✖ | Extra classes |

### 7.3 AppSwitcher
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apps` | `{ id: string; name: string; icon?: React.ReactNode; upsell?: boolean; disabled?: boolean; }[]` | ✔ | Apps to render |
| `onSelect` | `(id: string) => void` | ✖ | Callback on selection |
| `columns` | `number` | ✖ | Layout control (CSS grid) |
| `className` | `string` | ✖ | Extra classes |

### 7.4 CardDisplay
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | ✔ | Card nodes |
| `minColumnWidth` | `string` | ✖ (default `16rem`) | CSS min width for auto-fit |
| `gap` | `string` | ✖ (default `1rem`) | Grid gap |
| `className` | `string` | ✖ | Extra classes |

### 7.5 ReorderableList (Experimental)
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `{ id: string; content: React.ReactNode; }[]` | ✔ | Ordered items |
| `onReorder` | `(next: { id: string; content: React.ReactNode; }[]) => void` | ✖ | Called after reorder |
| `className` | `string` | ✖ | Extra classes |
| `disableControls` | `boolean` | ✖ | Hide control buttons |

### 7.6 ListSectionHeader
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `React.ReactNode` | ✔ | Section title (rendered `<h2>`) |
| `actions` | `React.ReactNode` | ✖ | Right-aligned actions |
| `className` | `string` | ✖ | Extra classes |

### 7.7 ListSectionFooter
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | ✔ | Footer content (counts, summaries) |
| `className` | `string` | ✖ | Extra classes |

### 7.8 VisuallyHidden
`<VisuallyHidden>` wraps text that should be available to assistive tech without visual display.

---

## 8. Analytics & Instrumentation Framework
Current: Pass-through of `data-*` attributes for DOM anchoring.
Planned: `useInstrumentation` hook providing `track(eventName, payload)` with automatic envelope enrichment (session, capability fingerprint, locale, feature flags version).

Event Taxonomy (excerpt): `ui.click`, `ui.focus`, `ui.blur`, `ui.dwell.bucket`, `ui.reorder`, `ui.switch.app`, `ui.nav.select`, `tour.*` (see Section 9).

Batching Strategy (future): In-memory queue flush every 5s OR size ≥ 20 OR visibility change.

---

## 9. Tutorialisation / Guided Journeys Strategy
See earlier strategy (retained) but now explicitly staged (Phases 1–6). Anchor reliability is achieved via deterministic `data-tour` attributes shipped by composites or added by consumers.

Key Implementation Guidelines:
- Provide consistent anchor ids: `dash.header.actions`, `side.nav.billing`, etc.
- Avoid sequential numeric suffix anchors that shift with reorder.
- Emit skip/completion analytics automatically from tour runner (future).

Privacy: No capture of user-entered free-form text; focus on structural events.

---

## 10. Capability & Access Control Integration
Patterns:
1. Pre-filter nav/app lists before rendering (`items.filter(capabilityPredicate)`).
2. Planned `<CapabilityGuard required={["billing.view"]}>…</CapabilityGuard>` inert/hide modes.
3. Analytics envelope includes hashed capability fingerprint (not raw set) to reduce leakage.

Design Considerations:
- UI must not hint at locked features visually unless intentionally upselling (upsell flag pattern in AppSwitcher).
- Avoid rendering disabled interactive elements for security sensitive features (prefer omission).

---

## 11. Performance, Accessibility & Quality Budgets
| Concern | Target | Notes |
|---------|--------|-------|
| Added JS per composite | < 2kb gz each (guideline) | Keep logic lean |
| Re-render depth on theme/lang switch | Only text/themed nodes | Attribute mutation or provider state |
| Lighthouse a11y score | ≥ 95 (demo pages) | Monitored in CI (future) |
| Interaction handler cost | < 1ms median | Delegate where possible |
| Bundle side effects | Single stylesheet import | All else pure |

A11y Checklist per component: Landmarks, roles, label association, keyboard navigation, focus visibility, reduced motion respect (where animation present).

---

## 12. Security, Privacy & Compliance Considerations
| Area | Guidance |
|------|----------|
| CSP | Whitelist Heroui CDN origin(s) |
| Dependency pinning | Integrity attributes mandatory for CDN assets |
| Data attributes | Avoid embedding user PII inside `data-*` keys/values |
| Telemetry | Strip/avoid content fields; bucket timing |
| LocalStorage | Only theme + language (and optional tour progress) |
| Accessibility | Ensure hidden elements are aria-hidden when appropriate |

---

## 13. Extensibility Patterns & Adding New Surfaces
1. Open issue describing repeated pattern & product rationale.
2. Define minimal props (data-in, events-out); prefer composition over config explosion.
3. Supply stable analytics & tour anchors; DO NOT auto-generate unpredictable ids.
4. Provide light CSS hooks (`.z-<surface>`, BEM or utility classes) — avoid heavy opinionated styling.
5. Add JSDoc with `@public` / `@experimental` tags.

Recommended Prop Design Heuristics:
- Required minimal identity (id/key) + children or render slots.
- Avoid boolean explosion; escalate into sub-objects if >3 related toggles.
- Provide `className` pass-through always.

---

## 14. Testing Strategy & Layered QA
| Layer | Tool | Focus |
|-------|------|-------|
| Unit | Jest | Prop contract, branching logic |
| Visual | Storybook + Chromatic (future) | Theming & responsive diff |
| Accessibility | axe / jest-axe | Roles, labels, violations |
| Interaction | Playwright | Keyboard nav, reorder flows |
| Performance | Custom micro benchmarks | Mount cost, re-render scope |

Minimum per new surface: unit test + story + a11y snapshot.

---

## 15. Migration Guidance
1. Replace bespoke headers with `DashboardHeader` (map actions → `actions` prop).
2. Standardize sidebars: `SideBar` (convert route arrays into `items`).
3. Consolidate app launchers into `AppSwitcher` referencing central app registry.
4. Replace ad-hoc card grids with `CardDisplay` (remove custom media queries; configure via props/CSS vars).
5. Add `data-analytics-id` attributes to meaningful interactive elements incrementally (Phase 1 instrumentation).
6. Remove local theme toggling code; delegate to provided helpers.
7. Introduce `I18nProvider` and migrate static strings to dictionary keys gradually (fallback still safe during transition).

---

## 16. Versioning & Stability Policy
- SemVer applied at package level.
- `@experimental` JSDoc implies potential breaking change without major version (documented in CHANGELOG).
- Breaking API shape: MINOR (while <1.0.0) then MAJOR after 1.0.0.
- Styling hook changes (class renames) are treated as breaking once stable.

Deprecation Flow:
1. Announce in CHANGELOG + README table (mark Deprecated).
2. Provide alternative migration snippet.
3. Remove after ≥2 minor versions (pre-1.0) or ≥1 major (post-1.0) unless security issue.

---

## 17. Roadmap (Phased)
| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Instrumentation Foundations | data-analytics-id adoption, click events |
| 2 | Dwell & Focus Metrics | Bucketed dwell, batching, visibility flush |
| 3 | Tour Runner (Manual Config) | Start/step/complete events, skip handling |
| 4 | Capability-Aware Tours | Step auto-skip + skip analytics |
| 5 | ReorderableList Full DnD | Keyboard + pointer, announcements |
| 6 | CapabilityGuard Component | Hide/inert modes + tests |
| 7 | Lazy Locale Loading | Async dictionary injection |
| 8 | Theming Density Modes | Compact/comfortable switch |
| 9 | Search & Filter Surfaces | FilterToolbar, GlobalSearchBar |
| 10 | KPI & Empty States | KPIBar, InlineEmptyState variants |

---

## 18. Contribution Workflow & PR Checklist
Workflow:
1. Issue → alignment on need.
2. Draft PR with docs + tests.
3. Review (API surface first, then internals).
4. Merge with conventional commit message.

PR Checklist:
- [ ] Composite only (no primitive duplication)
- [ ] Props minimal & documented
- [ ] a11y roles / keyboard support
- [ ] Theming via tokens (no hard-coded colors)
- [ ] Data attributes pass-through unmutated
- [ ] Tests / story / docs updated
- [ ] No unintentional bundle side effects
- [ ] Export added to root index (if public)
- [ ] Marked `@experimental` if unstable

---

## 19. FAQ / Troubleshooting
| Question | Answer |
|----------|--------|
| Theme not applying on first paint? | Ensure early script sets `data-theme` before React hydration. |
| Language switch not updating text? | Confirm components call `useTranslate()` inside render scope. |
| Missing translation returns key | Expected fallback. Add dictionary entry or audit. |
| SideBar not collapsing? | Verify `collapsible` prop not false and no overriding CSS. |
| ReorderableList reorder not persisting? | Implement `onReorder` to update parent state. |
| How to add analytics id? | Add `data-analytics-id="<surface.action>"` directly on interactive element. |
| Can I server render dictionaries? | Yes, pass `initial` to `I18nProvider`; hydrate dictionaries inline JSON. |

---

## 20. License
MIT (see root repository `LICENSE`).

---

### Quick Start Snippet
```tsx
import '@zana/ui/styles.css';
import { DashboardHeader, SideBar, AppSwitcher, CardDisplay, I18nProvider, applyTheme } from '@zana/ui';

applyTheme('light');

const i18n = {
	languages: ['en','fr'],
	fallback: 'en',
	dictionaries: {
		en: { 'dashboard.title': 'Dashboard' },
		fr: { 'dashboard.title': 'Tableau de bord' }
	}
};

function Shell() {
	return (
		<I18nProvider {...i18n}>
			<DashboardHeader title="<App Title>" />
			{/* ... */}
		</I18nProvider>
	);
}
```

---

### Change Log
See root or forthcoming `CHANGELOG.md` (to be added) for version history once >0.1.0 cadence begins.

---

## 🚀 Current Implementation Status

### ✅ Completed Setup (Phase 0)
- **Node Dependencies**: All required dependencies installed and configured
- **Storybook**: Configured with accessibility, viewport, and theme controls  
- **Testing**: Jest with React Testing Library, coverage reporting, ESM support
- **TypeScript**: Full type safety with proper ES module support
- **Build System**: TypeScript compilation with CSS asset copying
- **Design Tokens**: Complete CSS custom properties system for theming
- **Theme System**: Light/dark theme support with localStorage persistence
- **i18n Framework**: Runtime language switching utilities (translations owned by consuming apps)
- **Accessibility**: Screen reader support, focus management, and ARIA patterns
- **Internal Utilities**: Class merging, ID generation, focus trapping, keyboard utilities

### 📦 Available Components
- **VisuallyHidden**: Screen reader accessible content (✅ implemented with full test coverage)
- **Design Tokens**: Complete token system exported as JS objects and CSS custom properties
- **Theme Utilities**: `applyTheme()`, `toggleTheme()`, `usePreferredColorScheme()` functions
- **i18n Utilities**: `I18nProvider`, `useTranslate()`, `useLanguage()` hooks

### 🔧 Development Commands
```bash
# Install dependencies
pnpm install

# Run tests with coverage
pnpm test

# Type checking
pnpm typecheck

# Build package
pnpm build

# Start Storybook development server
pnpm storybook
```

### 📋 Next Implementation Steps
1. **DashboardHeader** component (page-level header with actions)
2. **SideBar** component (collapsible navigation with badges)
3. **AppSwitcher** component (application grid launcher)
4. **CardDisplay** component (responsive card grid wrapper)
5. **ListSectionHeader/Footer** components (section boundaries)

All foundational systems are in place and ready for component development!


## 2. External Dependency: Heroui CDN
Include once early (e.g., document/head or root layout):
```html
<link rel="stylesheet" href="https://cdn.heroui.dev/v1.4.0/theme.css" integrity="sha256-<PINNED-HASH>" crossorigin="anonymous" />
<script defer src="https://cdn.heroui.dev/v1.4.0/components.min.js" integrity="sha256-<PINNED-HASH>" crossorigin="anonymous"></script>
```
Guidelines:
- Always pin a specific version + integrity hash (supply via build pipeline variable).
- Maintain an allowlist of permitted CDN origins via CSP.
- Breakage mitigation: keep prior version tags for rollback.

## 3. Composite Component Catalog
Status legend: ✅ implemented  🧪 experimental  🔜 planned  ⏳ backlog / idea

### 3.1 Dashboard & Workspace
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `DashboardHeader` | ✅ | Primary page-level header (title / subtitle / actions / footer slot) | Actions slot accepts Heroui buttons / tabs / filters. |
| `SideBar` | ✅ | Vertical navigation with collapse, badges, active state | Capability + org aware (consumer filters items). |
| `AppSwitcher` | ✅ | Grid launcher for apps (enabled + upsell) | Feed with resolved app registry list. |
| `CardDisplay` | ✅ | Responsive card grid wrapper | Uses CSS vars for columns / gap. |
| `ReorderableList` | 🧪 | Ordered list scaffold (up/down buttons) | Future DnD (dnd‑kit) integration. |
| `ListSectionHeader` | ✅ | Section heading + actions region | Tutorial anchor. |
| `ListSectionFooter` | ✅ | Section footer meta (counts / summaries) | Analytics alignment. |
| `KPIBar` | 🔜 | Row of KPI metric tiles | Aggregates key stats (shell top area). |
| `FilterToolbar` | 🔜 | Query / filter chip bar | Integrates with search + capability restrictions. |
| `Breadcrumbs` | 🔜 | Hierarchical nav trail | Accepts array; supports overflow collapse. |
| `InlineEmptyState` | 🔜 | Minimal inline zero-data placeholder | Slot for action + illustration token. |
| `TabbedContentSwitcher` | 🔜 | Controlled tabbed layout wrapper | Light state mgmt; defers to URL sync via consumer. |
| `ActivityFeedList` | ⏳ | Stream/style wrapper for events feed | Virtualization integration later. |
| `NotificationCenterPanel` | ⏳ | Notification drawer surface | Groups by category + read state. |
| `GlobalSearchBar` | ⏳ | Unified command/search input container | Extensible provider slots. |
| `AppAnnouncementBanner` | ⏳ | Dismissible banner for announcements | Persistence via local store / server ack. |
| `CapabilityGuard` | ⏳ | Wrapper that hides/disables children based on capabilities | Avoids capability leaks in UI. |

### 3.2 Account Management
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `ProfileOverviewPanel` | 🔜 | Summary of user profile + primary attributes | Pulls from identity & membership modules. |
| `BillingSummaryCard` | 🔜 | Current plan, renewal date, balance | Plan change CTA slot. |
| `SubscriptionPlanSelector` | 🔜 | Plan comparison & selection matrix | Tied to pricing metadata & capability diffs. |
| `PaymentMethodList` | ⏳ | List + management of payment methods | Tokenized (no raw PAN exposure). |
| `InvoicesTable` | ⏳ | Paginated invoice history table wrapper | Export + filter slot. |
| `UsageQuotaBar` | 🔜 | Visual progress of quota consumption | Emits threshold events. |
| `TeamMembersList` | 🔜 | Members table/list with role badges | Capability gating for actions. |
| `InvitationManager` | 🔜 | Pending invites overview + revoke/resend | Uses invitations API. |
| `OwnershipTransferPanel` | ⏳ | Guided ownership transfer flow surface | Multi-step (verification hooks). |

### 3.3 Authentication & Identity
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `AuthLayout` | 🔜 | Shared layout wrapper (brand panel + form region) | Replaces ad‑hoc per page scaffolds. |
| `SignInHeader` | 🔜 | Consistent heading + legal fine print block | Accepts branding tokens. |
| `IdentityProviderPanel` | 🔜 | OIDC provider button group (Google etc.) | Driven by domain policy & provider config. |
| `OrgSwitcherModal` | 🔜 | Org selection (multi‑org users) | Hooks into membership query. |
| `PasswordlessMagicLinkStatus` | ⏳ | Magic link progress / fallback panel | Polling state handling. |
| `SessionExpiryPrompt` | ⏳ | “Session expiring” renewal countdown | Triggers silent refresh or logout. |
| `JourneyDecisionDebugPanel` | ⏳ | Dev-only view of journey classification result | Aids QA & snapshot diffing. |

### 3.4 Marketing & Public
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `HeroSection` | 🔜 | Primary marketing hero (headline + CTA + art slot) | Light text density for quick comprehension. |
| `FeatureGrid` | 🔜 | Grid of features with icon + copy | Supports 2–4 column responsive layout. |
| `TestimonialCarousel` | ⏳ | Rotating customer quotes | Prefers reduced motion respect. |
| `PricingTable` | 🔜 | Plan tiers comparison | Hooks into plan metadata; highlight recommended. |
| `CTASection` | 🔜 | Persisted call-to-action banner | A/B test friendly. |
| `FooterNavBar` | 🔜 | Marketing site footer (links, social, legal) | Multi-column & collapsible on mobile. |
| `LogoCloud` | ⏳ | Trusted by logos strip | Accessible alt text list. |
| `NewsletterSignup` | ⏳ | Email capture + consent snippet | Integrates with compliance flags. |

### 3.5 Utilities & Accessibility
| Component | Status | Purpose | Notes |
|----------|--------|---------|-------|
| `VisuallyHidden` | ✅ | Off-screen accessible text | Utility only. |
| `SkeletonWrapper` | ⏳ | Wrapper applying skeleton classes to children | Theme aware. |
| `FocusScopeBoundary` | ⏳ | Trap / scope for composite focus management | Integrates with dialog / overlays. |

> NOTE: Components tagged 🔜 / ⏳ are not exported until their first implementation PR merges. Experimental (🧪) APIs may change without a major version; treat them as internal until stabilized.

Primitives like `Button` / `TextField` remain temporarily exported for legacy convenience but are marked for deprecation once all downstream code aligns with Heroui consumption.

## 4. Installation
```bash
pnpm add @zana/ui
```
Then include (order matters → base tokens before Heroui for override layering):
```ts
import '@zana/ui/styles.css';
// Heroui CDN loaded in <head> (see section 2)
```

## 5. Theming & Tokens
We expose semantic tokens (`tokens`) that map to CSS custom properties. Override look & feel by redefining variables AFTER the base stylesheet but BEFORE Heroui overrides (or rely on cascade order). Example:
```css
:root { --color-accent: #4f46e5; }
[data-theme='dark'] { --color-accent: #6366f1; }
```
Runtime helpers: `applyTheme`, `toggleTheme`, `usePreferredColorScheme`, `useAutoApplyPreferredColorScheme`.

### 5.1 Instant (No‑Reload) Theme Switching
Theme changes are purely attribute + CSS variable based, so switching is immediate:
```ts
import { applyTheme, toggleTheme } from '@zana/ui';

// Direct set
applyTheme('dark');

// Toggle
toggleTheme();

// Persist choice (example)
function persistTheme(theme: 'light'|'dark') {
	applyTheme(theme);
	localStorage.setItem('zana.theme', theme);
}

// Auto-init on load
const saved = localStorage.getItem('zana.theme');
if (saved === 'light' || saved === 'dark') applyTheme(saved);
else if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
```
Key points:
- No React re-render is required; DOM attribute mutation is enough.
- Components should use tokens (CSS vars) rather than hard-coded colors so they live-update.
- Avoid forcing a full page reload; hydration-friendly.

### 5.2 Theme Persistence & Sync
| Concern | Recommendation |
|---------|---------------|
| Multiple tabs | Listen for `storage` events and re-apply theme if key changes. |
| SSR Flash | Add `data-theme` server-side (from cookie) to prevent flash. |
| Auto system follow | Offer a toggle (follow-system vs explicit). Store mode in localStorage. |


## 6. Usage Examples
### Dashboard Header
```tsx
import { DashboardHeader } from '@zana/ui';

<DashboardHeader
	title="Analytics Overview"
	subtitle="Last 30 days"
	actions={<div className="flex gap-2"><button className="h-btn h-btn--primary">Export</button></div>}
	footerSlot={<div className="tabs">/* filters or tabs */</div>}
/>;
```

### App Switcher
```tsx
<AppSwitcher
	apps={[{ id: 'hr', name: 'HR', icon: '🧑‍💼' }, { id: 'pay', name: 'Payroll', icon: '💸', upsell: true }]}
	onSelect={(id) => openApp(id)}
/>
```

### Reorderable List (Placeholder Controls)
```tsx
<ReorderableList
	items={items.map(i => ({ id: i.id, content: i.label }))}
	onReorder={(next) => saveOrder(next.map(n => n.id))}
/>;
```

## 7. Accessibility Strategy
Composite layers preserve semantic landmarks (`header`, `nav`, `ul`, `h1/h2`). Consumers must ensure underlying Heroui primitives meet contrast & focus. We add:
- ARIA labelling hooks where structural context is added.
- `VisuallyHidden` for additional instructions.
- Keyboard fallback controls for reordering (up/down) pending full DnD kit integration.

## 8. Analytics & Instrumentation
All composites pass through `data-*` attributes. Recommended patterns:
```tsx
<AppSwitcher data-analytics-surface="app-switcher" ... />
<SideBar data-analytics-surface="side-nav" />
```
Roadmap: `useInstrument` → direct emission to `@zana/telemetry`.

## 9. Tutorialisation, Guided Tours & Interaction Analytics

This package focuses on producing **structurally stable, semantically rich DOM** so that onboarding & behavioral instrumentation layers can be applied *without invasive rewrites*. Tutorialisation here means: first‑run education, contextual progressive disclosure, and ongoing feature adoption nudges.

### 9.1 Design Principles
| Principle | Rationale | Practical Implication |
|-----------|-----------|-----------------------|
| Non-blocking | Users should always have an escape route | Provide a visible "Skip" / close affordance on multi-step tours |
| Deterministic Anchors | Tours must re-bind reliably after reload | Stable class + `data-tour` attributes; avoid index-based selection |
| Capability-Aware | Don’t surface steps for inaccessible features | Gate tour step registration through capability checks |
| Privacy Respect | Avoid collecting raw user content | Only capture structural interaction metadata (ids, component kinds) |
| Low Overhead | Instrumentation must not degrade UX | Debounce dwell tracking & batch event dispatch |
| Extensible Taxonomy | Future ML / adoption scoring | Normalized event schema with versioning & context envelope |

### 9.2 Core Concepts
| Concept | Description |
|---------|-------------|
| Tour Step | A discrete instructional overlay bound to an anchor element. |
| Journey | A named ordered sequence of steps (e.g., `onboarding.dashboard.v1`). |
| Spotlight | Visual emphasis effect around the anchor (mask / elevation). |
| Attention Signal | Focus / hover / dwell metrics aggregated per anchor. |
| Interaction Event | Canonical structured record (click, focus, reorder, switch, dismiss). |
| Dwell Window | Time range user stayed over/focused on an anchor (start/end). |

### 9.3 Recommended Attribute & Class Conventions
| Attribute | Usage | Example |
|-----------|-------|---------|
| `data-tour="<step-id>"` | Declarative tour anchor | `<div data-tour="dash.header.actions">` |
| `data-analytics-id="<semantic-id>"` | Stable interaction id for clicks | `data-analytics-id="app-switcher.open-payroll"` |
| `data-analytics-group="<group>"` | Bucket related elements | `data-analytics-group="side-nav"` |
| `data-feature="<flag>"` | Flag origin (for A/B) | `data-feature="new-filter-toolbar"` |
| `data-capability="<cap-key>"` | Capability gating trace | `data-capability="billing.view"` |

### 9.4 Event Taxonomy (Proposal)
| Event | Trigger | Primary Fields |
|-------|--------|----------------|
| `ui.click` | Element activated (mouse / keyboard) | `analyticsId, group, capability, route, ts` |
| `ui.focus` | Focus enters anchor | `analyticsId, method(tab/mouse), ts` |
| `ui.blur` | Focus leaves anchor | `analyticsId, dwellMs, ts` |
| `ui.dwell.bucket` | Dwell interval end (thresholded) | `analyticsId, bucket(lt1s|1-3s|3-8s|gt8s)` |
| `ui.reorder` | ReorderableList item moved | `listId, from, to, itemId` |
| `ui.switch.app` | AppSwitcher selection | `appId, upsell(bool)` |
| `ui.nav.select` | SideBar item select | `itemKey, route` |
| `tour.started` | Journey begins | `journeyId, stepCount, variant` |
| `tour.step.viewed` | Step becomes visible | `journeyId, stepId, index` |
| `tour.step.completed` | User performs required action | `journeyId, stepId` |
| `tour.skipped` | User aborts tour | `journeyId, progressIndex` |
| `tour.completed` | Final step finished | `journeyId, totalTimeMs` |

All events inherit a context envelope: `{ ts, sessionId, userId?, orgId?, correlationId?, featureFlagsVersion, capabilitiesFingerprint, client:{ ua, locale } }`.

### 9.5 Attention & Dwell Tracking
1. Listen to `focus`, `blur`, `pointerenter`, `pointerleave` on elements with `data-analytics-id`.
2. Start a high‑resolution timestamp on enter/focus; compute delta on exit.
3. Bucket dwell times (e.g., `<1s`, `1–3s`, `3–8s`, `>8s`) to avoid leaking fine-grained timing that could expose sensitive behavior patterns.
4. Batch dwell events every 5–10 seconds or when tab visibility changes.

### 9.6 Sequence & Funnel Reconstruction
Instead of emitting a verbose event per micro interaction in real time, optionally maintain an in‑memory ring buffer (size 100) of recent interaction events; flush on:
- Tour completion / skip
- App switch
- Soft navigation (route change)
- Session end signal (visibility hidden + unload fallback)

This enables chronological analysis (e.g., did user open AppSwitcher before or after exploring filters?).

### 9.7 API Sketch (Future)
```ts
// High-level hooks (planned — not yet implemented)
const { track, startTour, endTour } = useInstrumentation();

track('ui.click', { analyticsId: 'side-nav.billing' });

startTour({
	journeyId: 'onboarding.dashboard.v1',
	steps: [
		{ anchor: '[data-tour="dash.header.title"]', id: 'welcome', content: 'Welcome to your dashboard' },
		{ anchor: '[data-tour="app.switcher"]', id: 'apps', content: 'Switch between products here.' }
	]
});
```
Implementation details (telemetry layer):
- Debounce identical sequential events (e.g., rapid hover flicker).
- Use monotonic clock for intra-session ordering (e.g., `performance.now()`).
- Add `schemaVersion` to every payload for forward compatibility.

### 9.8 Capability-Aware Tours
Before registering each tour step, verify the user has required capabilities (from session fingerprint). Skip or replace steps referencing locked features to avoid user confusion. Emit `tour.step.skipped_capability` for analytics.

### 9.9 Progressive Disclosure Pattern
| Scenario | Strategy |
|----------|----------|
| First login (new org) | Full guided journey (core 4–6 steps) |
| Returning user (new feature flag) | ONE highlight step + dismiss memory |
| Power user (multiple sessions, high engagement) | Suggest advanced feature (optional) |
| Soft failure detection (many clicks w/o success) | Inline contextual nudge (no modal) |

### 9.10 Privacy & Compliance Considerations
- Do **not** capture free‑form text typed into inputs (only high-level interaction events: focus, submit success/failure counts).
- Pseudonymize user identifiers where possible (hash stable id for cross-session analytics if regulatory scope demands).
- Offer org-level opt-out flag (`analytics.disabled`) to short‑circuit instrumentation dispatch.
- Respect `Do Not Track` / regional privacy flags (reduce granularity or disable dwell).

### 9.11 Performance Safeguards
- Use a single delegated event listener per event type at the document level.
- Batch network sends (e.g., flush every 5s or when batch size ≥ 20) with fetch keepalive for unload.
- Backoff / disable if telemetry endpoints respond with repeated 429 or >=500 series errors.

### 9.12 Testing Strategy
| Layer | Test |
|-------|------|
| Hook | Simulate focus/blur & assert dwell bucketing logic |
| Tour Runner | Step ordering, skipped steps on missing anchors |
| Analytics Adapter | Batching, retry, envelope enrichment |
| A11y | Ensure tour overlays do not trap focus without escape |

### 9.13 Minimum Viable Implementation (Phase Plan)
| Phase | Deliverable | Exit Criteria |
|-------|-------------|---------------|
| 1 | `data-analytics-id` adoption + basic click events | Events visible in dev telemetry sink |
| 2 | Focus/dwell tracking + batching | Dwell buckets emitted; perf < 2ms overhead median |
| 3 | Basic Tour runner (manual config) | Start/step/completion events present |
| 4 | Capability-aware / feature-flag conditioned tours | Locked steps auto-skipped |
| 5 | Sequence buffer + funnel reconstruction | Ordered sequence available for session replay summary |
| 6 | Self-serve config (JSON registry) | Adding a new tour requires no code change |

### 9.14 Future Enhancements
- Heatmap aggregation (server-side) using anonymized dwell buckets.
- In-product “help mode” toggle reusing tour infrastructure on demand.
- ML-based adoption scoring to trigger *contextual* upsell cards.
- Cross-device continuation (persist incomplete tour state per user/org).

---

## 10. Internationalization
Composite components avoid embedded copy except for fallback labels (all optional). Provide localized strings via props (e.g., `title`, `subtitle`, button labels in `actions` slot). For dynamic per‑language phrases without reload, use the lightweight runtime context supplied here.

### 10.1 Instant Language Switching (No Reload)
The UI package exposes a minimal runtime i18n layer: `I18nProvider`, `useI18n`, `useTranslate`, `useLanguage`.

```tsx
import { I18nProvider, useTranslate, useLanguage } from '@zana/ui';

const config = {
	languages: ['en', 'fr'],
	fallback: 'en',
	dictionaries: {
		en: { 'dashboard.title': 'Dashboard', 'dashboard.welcome': 'Welcome back, {name}!' },
		fr: { 'dashboard.title': 'Tableau de bord', 'dashboard.welcome': 'Bon retour, {name}!' }
	}
};

function Title() {
	const t = useTranslate();
	return <h1>{t('dashboard.title')}</h1>;
}

function LanguageSwitcher() {
	const { lang, setLang, available } = useLanguage();
	return (
		<select value={lang} onChange={(e) => setLang(e.target.value)}>
			{available.map(l => <option key={l}>{l}</option>)}
		</select>
	);
}

export function AppShell({ userName }: { userName: string }) {
	const t = useTranslate();
	return (
		<div>
			<Title />
			<p>{t('dashboard.welcome', { name: userName })}</p>
			<LanguageSwitcher />
		</div>
	);
}

export function Root() {
	return (
		<I18nProvider {...config}>
			<AppShell userName="Alex" />
		</I18nProvider>
	);
}
```

### 10.2 How It Works
| Aspect | Detail |
|--------|--------|
| Storage | Current language persisted in `localStorage` (configurable key). |
| Lookup | Flat key dictionary per language; falls back to primary language then key text. |
| Variable Interpolation | `{name}` tokens replaced from `vars` object. |
| Immediate Update | `setLang` triggers React state update → re-renders only text nodes using hooks. |
| SSR | Provide initial language via `initial` prop (e.g., cookie). |

### 10.3 Namespacing & Composition
Use `createI18nConfig(namespace, languages, parts)` helper to merge partial dictionaries across features, auto-prefixing keys.

### 10.4 Best Practices
| Recommendation | Rationale |
|----------------|----------|
| Keep keys semantic (`dashboard.welcome`) | Easier global search & refactoring |
| Avoid sentence concatenation | Proper grammar & RTL support |
| Limit dynamic placeholder count | Reduces translator complexity |
| Provide fallback copy for marketing surfaces | Avoid empty UI if translation missing |
| Audit missing keys in dev | Warn when key resolves to itself |

### 10.5 Future Enhancements
- Async dictionary chunk loading per locale.
- Pluralization & date/number formatting extension layer.
- Pseudo‑locale generation for L10n QA.
- Live translation editing overlay (internal tool).

## 11. Roadmap (Composite-Focused)
- [ ] Dashboard KPIs bar module
- [ ] FilterToolbar (query builder integration)
- [ ] InlineEmptyState / ZeroData patterns
- [ ] Breadcrumb trail component
- [ ] Dialog wrapper (Heroui modal composition) with capability gating hooks
- [ ] Hover / Context action bar for list items
- [ ] Full DnD implementation for `ReorderableList` (keyboard + pointer)
- [ ] Capability-gated `AppSwitcher` wrapper (auto hide locked apps)
- [ ] Theme density modes (comfortable / compact)

## 12. Migration Guidance
1. Replace custom in-app headers with `DashboardHeader`.
2. Migrate legacy sidebars to `SideBar` (map capability logic before rendering items).
3. Move custom app grid launchers to `AppSwitcher` (feed resolved registry data).
4. Introduce `CardDisplay` where manual CSS grids exist.
5. Phase out direct usage of exported primitive placeholders (`Button`, `TextField`).

## 13. Contribution Workflow
1. Open an issue describing new composite surface & rationale (tie to product journey or repeated pattern).
2. Implement in `src/components` with JSDoc + minimal styling hooks.
3. Add Storybook story (when storybook infra lands) demonstrating light/dark + responsive + a11y.
4. Add tests (structure snapshot + basic a11y role checks).
5. Update README table(s) if adding or deprecating a component.

### PR Checklist
- [ ] Composite only (no primitive re-invention)
- [ ] a11y roles & labelling
- [ ] Theming variables respected
- [ ] No hard-coded marketing copy
- [ ] Analytics hooks (data attributes passthrough) unaffected

## 14. Versioning & Stability
Semantic versioning; composites marked experimental: add `/** @experimental */` JSDoc. Breaking layout changes require a minor (or major if API shape changes) and changelog entry referencing downstream migration steps.

## 15. License
MIT
