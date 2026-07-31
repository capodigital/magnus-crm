# CODEX_STATE

## Current objective
Plan and execute the CRM described in `deep-research-report.md` using explicit goals, phased implementation, and project-local Codex skills.

## Current state
- Local Codex skills were installed in `.codex/skills` inside this project only.
- The repository is currently a Next.js admin template (`vuexy-mui-nextjs-admin-template`), not a CRM product yet.
- Main app entry points now include CRM route shells for home, inbox, leads, pipeline, billing, settings, and login, all wired into the shared layout/theme code.
- Dashboard routes redirect unauthenticated users to `/login`, while the root route now serves the public landing to unauthenticated visitors.
- The current shell uses a shared provider stack, a vertical or horizontal layout wrapper, and theme settings driven partly by cookies.
- The auth layer now uses NextAuth with Prisma, a `proxy.ts` guard, session helpers, and local NextAuth type augmentation.
- A server-only app context helper now resolves request host, session, tenant, and membership in one place.
- Dashboard access is now tenant-aware: platform-host requests still work with session auth, while tenant-scoped hosts require both a resolved tenant and a matching membership.
- The Prisma schema and generated client now include the tenant core plus the first CRM domain slice: contacts, leads, conversations, messages, pipelines, and pipeline stages.
- The repo now includes a reusable workspace bootstrap service and a CLI script to provision the first tenant, owner membership, branding, primary domain, and default pipeline.
- The Prisma schema now also includes the first WhatsApp integration slice: `WhatsappPhoneNumber`, `WhatsappWebhookEvent`, and conversation fields for `externalThreadKey` plus `whatsappPhoneNumberId`.
- A new WhatsApp webhook route now verifies `hub.challenge`, validates `X-Hub-Signature-256`, stores raw message/status events idempotently, and processes inbound message events into CRM entities.
- The backend now has dedicated modules for WhatsApp payload extraction, signature validation, raw event persistence, and CRM inbox upserts.
- Temporary Meta Cloud API quickstart credentials for the test number are now stored locally in the ignored `.env.local` file for sandbox validation only.
- The repo now has an expanded `.env.example` that lists the initial App, Database, NextAuth, Google, and Meta placeholders we will need.
- Google OAuth and Meta WhatsApp values are still pending from the user, as requested.
- The WhatsApp inbound slice now typechecks and lints cleanly against the current generated Prisma client.
- The real database was checked on July 31, 2026 and is still empty: there are no tenant workspaces and no WhatsApp phone mappings yet.
- The repo now includes a `register:whatsapp-phone` CLI path to upsert `phone_number_id -> tenant` mappings once the first workspace exists.
- The public launch surface now exists at `/` as a marketing landing for `crm.magnusecosystems.com` instead of redirecting straight to `/home`.
- The repo now includes public `/privacy-policy`, `/terms-of-service`, and `/data-deletion` routes, plus `robots.ts` and `sitemap.ts`, for launch and Meta review basics.
- The auth surface is now adapted to the CRM: `/login` and `/register` use Magnus-specific copy, legal links, and Next.js 16-safe `searchParams` handling.
- A lightweight registration API now creates a user and signs them in, while full tenant/workspace onboarding remains deferred.
- The CRM now exposes an authenticated self-service deletion route at `/settings/data-deletion` plus a matching `/api/account/delete` endpoint.
- Public QA was run on July 31, 2026 against `/`, `/privacy-policy`, `/terms-of-service`, `/data-deletion`, `/login`, and `/register`; the checked pages returned `200`, showed no console errors, and had no horizontal overflow in the inspected viewports.
- A public `/data-deletion` instruction page now explains how authenticated users can delete their account from `/settings/data-deletion`, what data is affected, and what to do if they cannot sign in.
- A first generated logo concept for Magnus CRM now exists at `public/images/brand/magnus-crm-logo-concept.png`.
- The CRM now has a reusable Magnus CRM mark in `src/@core/svg/Logo.tsx`, public SVG logo assets, favicon/app icons, a web manifest, and an Open Graph card based on the logo palette.
- The public site, login/register surfaces, and dashboard shell now inherit the teal, ink, mint, and gold brand palette instead of the original Vuexy purple theme.
- The Meta-ready app icon is available at `public/images/brand/magnus-crm-app-icon-1024.png`; it is a square PNG under 5 MB.
- Brand validation on July 31, 2026 passed `npx tsc --noEmit --pretty false`, `npm run lint`, `npm run build`, and local HTTP checks for `/`, manifest, favicon, app icons, SVG mark, Meta icon, and Open Graph image.

## Assumptions and constraints
- Keep this journal local to the repo.
- Do not modify the global Codex skills directory.
- Treat the current codebase as the starting template and evolve it incrementally.
- Preserve existing framework conventions unless the CRM rewrite specifically requires a change.
- If the user has not answered a product-shaping question yet, proceed with the recommended default and record it instead of waiting.
- White-label work is intentionally deferred until the core CRM loop is stable.
- Keep using project-local progress notes and explicit plan updates for the long-running CRM build.
- Keep unresolved Meta phone numbers out of tenant processing until onboarding or manual registration creates a trusted `WhatsappPhoneNumber` mapping.
- Never copy live or temporary secrets into the journal; keep them only in ignored local env files and recommend rotation if they were shared in chat.

## Files touched in this journal pass
- `.codex/CODEX_STATE.md`
- `.codex/PLANS.md`
- `.codex/DECISIONS.md`
- `.codex/PROJECT_INDEX.md`
- `.env.example`
- `package.json`
- `.env.local`
- `src/app/(dashboard)/layout.tsx`
- `src/lib/app-context.ts`
- `src/lib/tenant.ts`
- `src/lib/workspace-bootstrap.ts`
- `src/lib/crm/inbox-repository.ts`
- `src/lib/whatsapp/webhook-types.ts`
- `src/lib/whatsapp/webhook-signature.ts`
- `src/lib/whatsapp/webhook-event-store.ts`
- `src/lib/whatsapp/inbound-service.ts`
- `src/lib/whatsapp/phone-number-registration.ts`
- `src/app/api/webhooks/whatsapp/route.ts`
- `next.config.ts`
- `src/app/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/data-deletion/page.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/(blank-layout-pages)/register/page.tsx`
- `scripts/bootstrap-workspace.ts`
- `scripts/register-whatsapp-phone-number.ts`
- `src/views/Register.tsx`
- `src/views/Login.tsx`
- `src/components/marketing/PublicSiteShell.tsx`
- `src/components/marketing/LandingPage.tsx`
- `src/components/marketing/LegalDocumentPage.tsx`
- `src/components/marketing/public-site.module.css`
- `src/app/api/register/route.ts`
- `src/lib/auth/register-user.ts`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/settings/data-deletion/page.tsx`
- `src/components/crm/DeleteAccountPanel.tsx`
- `src/app/api/account/delete/route.ts`
- `src/lib/account/delete-user-account.ts`
- `public/images/brand/magnus-crm-logo-concept.png`
- `public/images/brand/magnus-crm-mark.svg`
- `public/images/brand/magnus-crm-logo.svg`
- `public/images/brand/magnus-crm-mark-512.png`
- `public/images/brand/magnus-crm-app-icon-1024.png`
- `public/images/brand/magnus-crm-og.png`
- `src/@core/svg/Logo.tsx`
- `src/@core/theme/colorSchemes.ts`
- `src/app/favicon.ico`
- `src/app/icon.png`
- `src/app/apple-icon.png`
- `src/app/manifest.ts`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/layout/shared/Logo.tsx`
- `src/configs/primaryColorConfig.ts`
- `.eslintrc.js`
- `tsconfig.json`
- `src/lib/prisma.ts`
- `src/types/external/index.d.ts`
- `prisma/schema.prisma`
- `prisma/generated/prisma/*`

## Next safe action
Bootstrap the first real tenant workspace, connect the lightweight registration flow to that onboarding path, and then continue with Meta Embedded Signup plus `phone_number_id` registration for end-to-end WhatsApp validation.
