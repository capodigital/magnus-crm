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
- Production now serves the protected Embedded Signup route: `npm run check:production-embedded-signup` returned the expected `401 application/json` response.
- The v4 implementation is committed and published on `main` at `d2b767a`, matching `origin/main`; Vercel environment values were configured and deployed by the user, but secret values were not inspected.
- The local Git remote contains an embedded credential; never print or reuse it, and rotate it before the next push.
- Added `npm run check:production-embedded-signup`; it passes against production with `401 application/json`.
- Aligned the Facebook login payload with Meta Embedded Signup v4 (`extras.version`) and added a parser fallback for single-item `waba_ids`; multi-WABA events without a primary WABA are rejected explicitly.
- Release-readiness verification passed on 2026-10-04: Embedded Signup utility tests, token-vault tests, TypeScript, ESLint, production build, diff check, and the production protected-route smoke test.

## Next safe action

Complete one real production Embedded Signup connection and phone registration, record the English review video, and resubmit `business_management`; do not reuse the rejected screencast. Confirm separately that previously exposed Meta tokens and the embedded Git remote credential have been rotated.
