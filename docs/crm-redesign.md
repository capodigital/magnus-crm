# CRM redesign — 2026-10-12

## Direction

Magnus is a general commercial CRM. Contacts, opportunities, pipeline and conversations define its navigation. Integrations extend the workspace; a messaging provider does not define the product.

- Light mode by default, white surfaces on `#F4F7FA`, ink `#203346`, secondary text `#5E7083` and the existing teal brand accent.
- Compact typography, quiet borders, soft active navigation and two-column metric cards on mobile.
- Spanish product copy; remove development roadmap text, fictitious metrics and template account/footer content.
- Version the appearance cookie and matching MUI storage key so existing installations adopt the light design once; subsequent appearance choices persist.

## Routes and data

- `/home`: tenant-scoped contact, open opportunity, active conversation and won opportunity counts, plus recent opportunities and their status distribution.
- `/contacts` and `/leads`: read-only, tenant-scoped tables with 25-record pagination.
- `/pipeline`: read-only view of existing stages and the latest 200 open opportunities; no drag-and-drop or editing is added.
- `/settings`: workspace/account summary and links to integrations.
- `/settings/integrations`: catalog with the current WhatsApp connection and clearly unavailable email/calendar placeholders.
- `/settings/integrations/whatsapp`: existing Meta Embedded Signup, phone registration, advanced manual linking and template management.
- `/settings/data-deletion`: existing account deletion under the shared settings navigation.

Database reads live in `src/lib/crm/workspace-query.ts`; routes resolve the authorized workspace before querying. No schema, messaging API, Meta permission, token storage or onboarding security changes are included. WhatsApp remains the only implemented conversation channel. The catalog can grow as new integrations are implemented.

## Verification

- TypeScript and ESLint passed.
- Existing Embedded Signup utility and token-vault tests passed.
- Six new query functions successfully executed read-only against the isolated reviewer workspace.
- Browser QA used temporary fixture-only pages at mobile (390 px), tablet (default viewport) and desktop (1440 px) widths. Checked the dashboard, integrations, WhatsApp panel, empty inbox and populated conversation; corrected mobile wrapping and a server/client navigation boundary.
- All temporary fixture routes and the query smoke script were removed.
- Production build passed; final routes include `/contacts`, `/settings/integrations` and `/settings/integrations/whatsapp`, with no temporary preview routes.

A real authenticated Meta connection and production deployment were not performed. Existing external Meta App Review constraints remain applicable.
