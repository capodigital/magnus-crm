# Codex State

## Current objective

Implement the tenant-scoped Meta Embedded Signup foundation needed for multi-tenant WhatsApp onboarding and a future `business_management` resubmission.

## Current status

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
- Production currently serves the previous deployment: `POST /api/workspace/whatsapp-embedded-signup/state` returns the landing HTML instead of the local handler's unauthenticated JSON response.
- The local implementation is uncommitted on `main`; Vercel CLI has no authenticated session, so deployment and production environment changes require an explicitly authorized user action.
- The local Git remote contains an embedded credential; never print or reuse it, and rotate it before the next push.
- Added `npm run check:production-embedded-signup`; it currently fails against production with `200 text/html` because the old deployment is still active. After deploy it must pass with `401 application/json` before using Meta.

## Next safe action

After rotating the Git credential, deploy the current checkout and configure the new Meta variables in Vercel. Then complete one real Embedded Signup connection and phone registration, record the English review video, and resubmit `business_management`; do not reuse the rejected screencast.
