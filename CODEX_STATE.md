# Codex State

## Current objective

Google login, registration and secure account linking are implemented and validated locally. User handles OAuth credentials, publication and the final real Google consent test.

## Google authentication — 2026-11-16

- User requested Google login/registration and exact .env / Google Console setup. Instructions are in docs/google-auth.md; no credential values were printed or modified. Local Google credentials were absent or placeholders at inspection.
- Login/register now show Continue with Google. New Google users complete a company/terms form; the server creates tenant, branding, OWNER membership and pipeline atomically. Repeated/concurrent submissions preserve one workspace.
- Existing password users link the same-email Google account from Settings after signing in. Email verification, default account-linking protection, PKCE/state/nonce and safe local redirects are retained. No automatic email-based merging.
- Shared workspace creation now serves password and Google onboarding. Removed obsolete NextAuth ambient type shims so the installed library types validate the integration.
- Google service/security tests, local HTTP checks, TypeScript, ESLint, diff validation and final production build pass. Browser QA verified login/register buttons, generic unavailable-service messaging, company onboarding through to the new workspace and linked-account settings using local identity fixtures. No real Google consent/code exchange was performed; this remains pending credentials. Preview seed removed and local services stopped. No remote writes, deployment, commit or push performed.

## Follow-up — 2026-11-16

- Added explicit Nuevo cliente (CUSTOMER), existing Nuevo contacto (PROSPECT), automatic navigation to the saved contact, and inline contact creation inside manual lead/opportunity forms.
- Added persistent CRM section navigation, home shortcuts, a Marketing menu group, direct contact tabs, an Information tab and individual activity creation shortcuts. Contacts use cards on mobile. Home/inbox now link to the contact detail.
- Added server-side AI routing: emails default to gpt-6-luna, proposals to gpt-6.1-sol, with environment overrides and existing OPENAI_MODEL preserved as a fallback. Email drafts can be reviewed and applied to the editable message.
- User clarified that keys/models are managed behind the scenes. Removed the AI configuration page, model selectors/labels, configuration status banners and technical setup links from the CRM. Removed AI configuration from client props and model IDs from public draft responses. Marketing and contact history show operational errors while provider diagnostics stay in the database. Email settings now explain campaign workflows only.
- Follow-up validation: AI tests cover server-owned selection, metadata-free public responses and generic provider errors; local CRM and HTTP suites, typecheck, targeted lint and final production build pass. Browser QA verified the proposal form and unavailable-service message, email workflow page and campaign composer without technical configuration. No real provider calls were made; the temporary seed script was removed and local preview services stopped. Build initially found stale generated types for the removed AI settings route; regeneration resolved them.
- Confirmed via authenticated browser and Vercel CLI that crm.magnusecosystems.com still serves the October 12 production deployment (dpl_Cf7XBHbBzcE1dD9HqTvLcTBAvyA6). It has the old navigation; this explains missing features.
- Configured Neon database is reachable. Full read-only Prisma schema diff is empty; no DB migration was needed or applied in this follow-up. The earlier table-presence probe used Prisma model names instead of mapped table names and was corrected.
- Local .env contains configured OpenAI, Resend and cron credentials (values never printed). Production Vercel env listing does not yet contain the new email/AI variables. No real provider request or email send performed.
- Vercel project linked locally for diagnosis. CLI unexpectedly regenerated .env.local from Development; removed its generated OIDC token and restored three WhatsApp overrides using existing .env values. Exact previous override values were not retained; .env itself was not modified. No remote env changes, deployment, commit or push performed.
- Local typecheck, lint, production build, service integration, AI mocked-provider tests and HTTP roles/isolation tests passed. Visual QA verified customer creation, manual lead with nested contact creation, information/chats/proposals, reminder creation and campaign draft/segment preview. Mobile QA at 390px has no horizontal document overflow or new console errors. Fixed duplicate dialog/field title IDs and wrapping tab indicators. Temporary seed script removed.
- User explicitly chose “Dejar los cambios locales” and confirmed “Yo me encargo de publicarlo”. Leave the implementation local; do not deploy or configure remote variables. Activation instructions are in docs/crm-growth.md.

## Previous implementation status — 2026-11-13

- Implemented locally: editable contacts, separate leads/opportunities, editable pipelines/stages, contact detail with chats, activities and proposals, agenda, campaigns and automation rules.
- Resend outbox includes scheduling, pause/resume, consent, unsubscribe, tenant checks, idempotency, bounded retries and a protected cron endpoint. OpenAI proposal generation is server-only and optional.
- Prisma migration and generated client are ready. Migration applied successfully to isolated local PostgreSQL; schema comparison returned no differences. Remote Neon connection failed with P1001, so no remote schema changes were made.
- TypeScript, ESLint, production build, WhatsApp utility/token-vault checks, CRM integration tests and authenticated HTTP tests passed. Resend/OpenAI calls were mocked; no real messages were sent.
- Desktop/mobile UI QA passed with local fixtures, including creation, stage changes, timeline updates, task completion and segment preview. Temporary preview seed script removed.
- Implementation, activation steps and explicit limits: docs/crm-growth.md.

## WhatsApp integration baseline

- Reviewer user created through the existing Prisma workspace bootstrap flow.
- Reviewer workspace: `Magnus CRM - Meta Review` (`magnus-crm-meta-review`).
- Reviewer role: tenant `OWNER`.
- Production login page responded with HTTP 200.
- Password verification passed against the stored bcrypt hash.
- Production NextAuth credentials callback returned the reviewer redirect to `/home`.
- Credentials are intentionally not stored in the repository.
- Meta App Review approved `whatsapp_business_messaging`, `whatsapp_business_management`, and `public_profile`.
- Meta rejected only `business_management` because the submitted screencast did not show the complete requested use case.
- Added a real Facebook SDK launch path in Settings with the WhatsApp Business App Onboarding feature flag.
- Added authenticated state-cookie protection, server-side Meta code exchange, WABA/phone verification, and tenant persistence.
- Added AES-256-GCM encryption for tenant WhatsApp access tokens and tenant-token routing for outbound messages and templates.
- Added WABA webhook subscription, phone registration with a non-persisted six-digit PIN, token expiry handling, and optional provider System User attachment.
- When Meta returns `business_id`, the onboarding now calls `/{business_id}/client_whatsapp_business_accounts` and rejects a WABA that is not in that Business Portfolio before persistence, giving the `business_management` review flow a concrete server-side use.
- Preloads the Facebook SDK and nonce before the click so `FB.login` is invoked synchronously; coexistence callbacks without a `phone_number_id` are resolved server-side when the WABA has one phone.
- Prisma Client was regenerated successfully after the schema change.
- TypeScript, ESLint, the Embedded Signup utility checks, `git diff --check`, and the production build pass after adding registration/expiry fields.
- Settings now keeps Embedded Signup disabled unless both public and server App IDs, the Config ID, the app secret, and a valid Base64 32-byte encryption key are present.
- Added a reproducible token-vault check covering AES-256-GCM ciphertext, IV/auth tag, and round-trip decryption.
- Added `npm run db:push` as the repeatable Prisma-only schema command.

## Constraints and risks

- The WhatsApp Business Account previously shown by Meta is disabled and must be restored before live WhatsApp tests.
- The reviewer workspace is isolated and does not contain customer data.
- Do not add Meta access tokens, passwords, or other secrets to source control or progress notes.
- The Prisma schema is synchronized with the configured Neon database through `npm run db:push`; a direct `tsx` query must preload dotenv because the application Prisma module expects Next.js to provide environment loading.
- Production now serves the protected Embedded Signup route: `npm run check:production-embedded-signup` returned the expected `401 application/json` response.
- The v4 implementation is committed and published on `main` at `d2b767a`, matching `origin/main`; Vercel environment values were configured and deployed by the user, but secret values were not inspected.
- The local Git remote contains an embedded credential; never print or reuse it, and rotate it before the next push.
- Added `npm run check:production-embedded-signup`; it passes against production with `401 application/json`.
- Aligned the Facebook login payload with Meta Embedded Signup v4 (`extras.version`) and added a parser fallback for single-item `waba_ids`; multi-WABA events without a primary WABA are rejected explicitly.
- Release-readiness verification passed on 2026-10-04: Embedded Signup utility tests, token-vault tests, TypeScript, ESLint, production build, diff check, and the production protected-route smoke test.
- The first real production Embedded Signup reached the server, but Meta rejected the Business Portfolio ownership query with `(#200) Requires business_management permission to manage the object`; this confirms the remaining blocker is App Review access, not the WABA ID or CRM persistence flow.
- Added a focused Spanish error message for the missing `business_management` permission while preserving Meta's original diagnostic detail; the behavior is covered by the Embedded Signup utility test.
- After the diagnostic change, the Embedded Signup utility test, token-vault test, TypeScript, ESLint, production build, production protected-route smoke test, and diff check passed.
- The Settings Embedded Signup panel now states that advanced `business_management` access is required before the Business Portfolio ownership check can succeed.
- Business Portfolio WABA verification now follows Meta pagination with a bounded cursor loop, preventing valid WABAs on later pages from being rejected and avoiding unbounded requests.
- The pagination helper is covered by the Embedded Signup utility checks; after this change TypeScript, ESLint, build, and diff validation passed.
- Provider System User configuration now fails explicitly when only one of `META_SYSTEM_USER_ID` or `META_SYSTEM_USER_ACCESS_TOKEN` is present, and validates the ID format; both absent remains a supported pre-approval configuration.
- After this change the Embedded Signup utility test, TypeScript, ESLint, build, and diff validation passed.
- Extracted provider System User environment validation into a pure helper with coverage for empty, complete, partial, and invalid configurations.
- The final validation after this helper passed: Embedded Signup utility test, TypeScript, ESLint, build, and diff check.
- The callback now consumes the HttpOnly Embedded Signup state cookie on accepted callback attempts even when Meta or validation fails, preventing state reuse after an error.
- After this callback hardening, the Embedded Signup utility test, TypeScript, ESLint, build, and diff check passed.
- Added `docs/meta-business-management-review.md` with secret-free English reviewer instructions, the complete test flow, and the server-side rationale for `business_management`.
- Release-readiness audit passed on 2026-10-12: Embedded Signup and token-vault tests, TypeScript, ESLint, production build, production protected-route smoke check, secret-file tracking check, and diff validation all passed. The only release blocker is Meta approval plus a real post-approval E2E connection.

## Prior next action (superseded by the follow-up status above)

Restore Neon connectivity and apply the additive CRM schema before deploying. For the existing db-push baseline, run npm run db:push and npm run db:backfill:crm; use migration deploy only with an initialized migration history. Configure Resend, a verified sender, CRON_SECRET, a scheduler for /api/cron/email, and optional OpenAI credentials/model. Then validate one authorized internal real email and its unsubscribe flow. Deployment was not requested or performed.

Retain the prior Meta approval/connection follow-up and credential-rotation constraints above.
