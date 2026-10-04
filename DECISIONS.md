# Decisions

## 2026-09-05: Meta reviewer account isolation

- Create a dedicated `meta-review@magnusecosystems.com` owner account instead of sharing an administrator account.
- Use a separate active workspace named `Magnus CRM - Meta Review` so Meta reviewers cannot access production customer data.
- Reuse the existing `bootstrapWorkspace` transaction to keep user, tenant, branding, membership, and pipeline creation consistent.
- Pass the password only at execution time; never store it in source files, environment files, or journal notes.
- Keep live WhatsApp testing deferred while the production WABA remains disabled.

## 2026-10-01: Meta permission review outcome

- Keep the approved WhatsApp permissions; they cover the current messaging, templates, and WABA management paths.
- Do not treat the `business_management` rejection as a WhatsApp messaging failure; Meta identified a screencast/use-case mismatch.
- Do not resubmit the generic Business Manager permission until the actual Embedded Signup or server-to-server flow is demonstrated end to end.
- Preserve `business_management` as a future requirement for multi-tenant Embedded Signup, subject to the final implementation path.

## 2026-10-01: Tenant-scoped Embedded Signup foundation

- Use the Meta/Facebook JS SDK only to launch the user-facing flow; exchange the returned OAuth code on the server.
- Require an authenticated owner/admin session and a short-lived HttpOnly state cookie before accepting the callback.
- Verify the WABA and phone number returned by the flow with Meta before persisting them to the active tenant.
- Encrypt each exchanged WhatsApp access token with AES-256-GCM using `META_ENCRYPTION_KEY`; never expose it to a client component.
- Preserve the existing manual connection path and global `META_ACCESS_TOKEN` as a fallback for records that have no tenant token.
- Use the tenant connection token for outbound messages and template management once a connection is made.
- Do not resubmit the rejected permission until the real Meta flow is configured, tested, and recorded end to end.
- Subscribe the connected WABA to the app during onboarding and require phone registration with a six-digit PIN that is never persisted.
- Store the exchanged token expiry and fall back to the configured provider System User token after it expires.
- Make provider System User attachment optional until Meta grants the required `business_management` access and the production System User credentials are configured.
