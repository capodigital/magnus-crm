# PROJECT_INDEX

## Repository snapshot

- Stack: Next.js 16, React 19, TypeScript, MUI, Tailwind CSS v4.
- Current package name: `vuexy-mui-nextjs-admin-template`.
- The repo is a UI-heavy admin template with shared layout, menu, theme, and utility layers already in place.
- The shell now contains a CRM-oriented home page and route placeholders for inbox, leads, pipeline, billing, and settings.
- Auth is wired with NextAuth + Prisma, a `proxy.ts` guard, and a credential-plus-Google login surface.
- Prisma now carries the first tenant core: tenants, tenant domains, tenant branding, and memberships.
- Prisma also now carries the first CRM workflow entities: contacts, leads, conversations, messages, pipelines, and pipeline stages.
- Prisma now also carries the first WhatsApp integration entities: `WhatsappPhoneNumber` and `WhatsappWebhookEvent`.
- The backend now includes a production-oriented inbound WhatsApp webhook slice with signature validation, raw event persistence, and CRM upsert orchestration.
- The repo now includes a CLI for binding Meta WhatsApp phone numbers to tenant workspaces after bootstrap.
- The repo now also includes a public landing, legal pages, a public data deletion instruction page, SEO metadata routes, a lightweight registration API, and an internal user data deletion route.
- The repo now includes a first generated Magnus CRM logo concept under `public/images/brand/`.
- The app shell and public site now use a reusable Magnus CRM SVG mark plus branded favicon, app icon, Apple icon, manifest, and Open Graph card.

## Key files

- `package.json` - scripts, dependencies, and package identity.
- `.eslintrc.js` - lint rules and generated-code ignore patterns.
- `tsconfig.json` - TypeScript project settings, including generated-code exclusions.
- `.env.example` - required environment placeholders for app, database, NextAuth, and Meta.
- `next.config.ts` - Next.js config; the root redirect to `/home` has been removed so `/` can serve the marketing landing.
- `src/app/layout.tsx` - root HTML/body shell and app metadata.
- `src/app/page.tsx` - public landing for unauthenticated visitors; redirects authenticated users to `/home`.
- `src/app/privacy-policy/page.tsx` - public privacy policy page for launch and Meta review.
- `src/app/terms-of-service/page.tsx` - public terms page for launch and Meta review.
- `src/app/data-deletion/page.tsx` - public instructions explaining how users can delete their data.
- `src/app/robots.ts` - robots rules for public vs internal routes.
- `src/app/sitemap.ts` - sitemap entries for the public site.
- `public/images/brand/magnus-crm-logo-concept.png` - generated PNG logo concept for Magnus CRM.
- `public/images/brand/magnus-crm-mark.svg` - reusable standalone Magnus CRM SVG mark for public/static usage.
- `public/images/brand/magnus-crm-logo.svg` - reusable full lockup SVG for brand usage.
- `public/images/brand/magnus-crm-app-icon-1024.png` - square PNG app icon suitable for Meta app review upload.
- `public/images/brand/magnus-crm-og.png` - social preview image used by Open Graph and Twitter metadata.
- `src/@core/svg/Logo.tsx` - shared inline logo mark used by the CRM shell and public site.
- `src/app/globals.css` - global styles and Tailwind/theme integration.
- `src/app/manifest.ts` - web app manifest and installable app icons.
- `src/app/(dashboard)/home/page.tsx` - CRM dashboard landing page.
- `src/app/(dashboard)/inbox/page.tsx` - inbox shell for WhatsApp conversations.
- `src/app/(dashboard)/leads/page.tsx` - leads shell.
- `src/app/(dashboard)/pipeline/page.tsx` - pipeline shell.
- `src/app/(dashboard)/billing/page.tsx` - billing shell.
- `src/app/(dashboard)/settings/page.tsx` - workspace settings shell.
- `src/app/(dashboard)/settings/data-deletion/page.tsx` - internal authenticated user data deletion screen.
- `src/app/(blank-layout-pages)/login/page.tsx` - login route entry point.
- `src/app/(blank-layout-pages)/register/page.tsx` - lightweight register route entry point.
- `src/views/Login.tsx` - login view component.
- `src/views/Register.tsx` - register view component adapted for Magnus CRM.
- `src/components/marketing/PublicSiteShell.tsx` - shared public site frame for landing and legal pages.
- `src/components/marketing/LandingPage.tsx` - conversion-focused public landing content.
- `src/components/marketing/LegalDocumentPage.tsx` - reusable layout for privacy and terms content.
- `src/components/marketing/public-site.module.css` - styling for the public marketing and legal surfaces.
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth route handler.
- `src/app/api/register/route.ts` - lightweight user registration endpoint.
- `src/lib/auth/register-user.ts` - registration service that validates input and creates the auth user.
- `src/app/api/account/delete/route.ts` - authenticated account deletion endpoint.
- `src/lib/account/delete-user-account.ts` - deletion service for the current auth user.
- `src/app/api/webhooks/whatsapp/route.ts` - Meta webhook verification and inbound event entry point.
- `src/lib/auth.ts` - NextAuth options, callbacks, and session helper.
- `src/lib/app-context.ts` - server-only resolver for request tenant, session, and membership.
- `src/lib/tenant.ts` - host-based tenant context helper.
- `src/lib/workspace-bootstrap.ts` - reusable tenant/workspace provisioning service.
- `src/lib/crm/inbox-repository.ts` - tenant-scoped upserts for contacts, leads, conversations, and inbound messages.
- `src/lib/whatsapp/webhook-types.ts` - minimal Meta payload types plus message/status extraction.
- `src/lib/whatsapp/webhook-signature.ts` - `X-Hub-Signature-256` validation helper.
- `src/lib/whatsapp/webhook-event-store.ts` - tenant phone-number resolution plus raw webhook event persistence.
- `src/lib/whatsapp/inbound-service.ts` - orchestration layer that connects webhook events to CRM upserts.
- `src/lib/whatsapp/phone-number-registration.ts` - service for safely binding a Meta `phone_number_id` to an existing tenant.
- `src/proxy.ts` - request guard and auth context injector.
- `src/views/NotFound.tsx` - not-found view component.
- `src/components/crm/SectionPage.tsx` - shared route shell for CRM sections.
- `prisma/schema.prisma` - tenant-aware data model and NextAuth tables.
- `prisma/schema.prisma` - tenant-aware data model, auth tables, and CRM workflow entities.
- `prisma/generated/prisma/` - generated Prisma client for the current schema.
- `scripts/bootstrap-workspace.ts` - CLI entry point for creating the first tenant workspace.

## Important directories

- `src/app/` - App Router routes and layouts.
- `src/components/` - reusable components, shared UI, and layout pieces.
- `src/@core/` - core theme, hooks, utilities, and design-system primitives.
- `src/@layouts/` - layout wrappers and layout-specific components.
- `src/@menu/` - navigation system and menu rendering.
- `src/configs/` - theme and color configuration.
- `src/lib/crm/` - tenant-scoped CRM repository modules.
- `src/lib/whatsapp/` - Meta webhook parsing, validation, persistence, and orchestration.
- `public/` - static images and assets.
- `.codex/skills/` - project-local Codex skills installed for this repo.
- `scripts/register-whatsapp-phone-number.ts` - CLI to register or refresh a tenant WhatsApp phone binding.

## Useful commands

- `npm run dev` - start the local Next.js dev server.
- `npm run build` - build production output.
- `npm run lint` - run ESLint across the repo.
- `npm run lint:fix` - apply automatic lint fixes.
- `npm run bootstrap:workspace` - provision a tenant, owner membership, branding, primary domain, and default pipeline from env vars.
- `npm run register:whatsapp-phone` - bind `META_PHONE_NUMBER_ID` and `META_WABA_ID` to an existing tenant slug.
- `npm exec -- prisma generate` - refresh the generated Prisma client after schema changes.
- `npm exec -- tsc --noEmit --pretty false` - run a fast typecheck without building the app.
- `npm run format` - format `src/**/*.{js,jsx,ts,tsx}` with Prettier.
- `npm run build:icons` - regenerate the icon CSS bundle.

## Notes

- A `git status` check was not available from the current workspace view, so this index is based on the filesystem and package metadata.
- The dashboard home now frames the workspace around leads, conversations, pipeline, billing, and settings instead of generic template content.
- The remaining external values we still need from the user are the final Google OAuth pair plus the Meta app secret, verify token, WABA ID, and phone number ID for the first tenant integration.
- Public launch QA on July 31, 2026 confirmed that `/`, `/privacy-policy`, `/terms-of-service`, `/data-deletion`, `/login`, and `/register` rendered without console errors or horizontal overflow in the inspected viewports.
