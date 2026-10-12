# Codex State

## Current objective

Redesign Magnus as a general CRM with a light default theme and move the complete WhatsApp flow under Configuration → Integrations → WhatsApp Business.

## Current status

- The light CRM redesign is implemented locally. Contacts, opportunities, pipeline and conversations now define the navigation.
- WhatsApp onboarding, phone registration, advanced manual connection and templates moved to `/settings/integrations/whatsapp`; `/settings` now contains the general workspace summary.
- Home uses real tenant-scoped data; contacts/opportunities have read-only paginated tables, and pipeline displays existing stages.
- TypeScript, ESLint, Embedded Signup and token-vault checks pass. All six new workspace query functions passed a read-only smoke check in the isolated reviewer workspace.
- Responsive browser QA used isolated fixtures; all temporary preview routes/scripts were removed. Final production build passed and includes the new protected CRM/integration routes.
- Design, routes and validation details are documented in `docs/crm-redesign.md`.

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

## Next safe action

Review the redesigned app through a real authenticated session and deploy only when requested. Then perform the existing post-approval Meta validation described below.

Complete one real production Embedded Signup connection and phone registration after `business_management` is approved, record the English review video using the working end-to-end flow, and resubmit the permission; do not bypass the Business Portfolio ownership check or reuse the rejected screencast. Confirm separately that previously exposed Meta tokens and the embedded Git remote credential have been rotated.
