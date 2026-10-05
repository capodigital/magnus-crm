# Plans

## Meta reviewer account

- [x] Inspect the authentication and multi-tenant bootstrap flow.
- [x] Select an isolated reviewer email, workspace, and owner role.
- [x] Create the reviewer account through Prisma-backed application code.
- [x] Verify the password hash, tenant membership, and public login endpoint.
- [x] Prepare reviewer instructions without exposing secrets.
- [ ] Restore the disabled WhatsApp Business Account before live messaging evidence.
- [ ] Reconnect a review-safe WhatsApp asset if Meta requires interactive testing.

## Meta `business_management` resubmission

- [x] Goal 1: Confirm that the permission belongs to the planned multi-tenant Embedded Signup flow.
- [x] Goal 2: Add tenant-scoped WhatsApp connection fields and a server-side encrypted token vault.
- [x] Goal 3: Implement the authenticated nonce, Meta code exchange, resource verification, and connection persistence.
- [x] Goal 4: Add the production Settings UI and Facebook SDK launch path for Embedded Signup v4.
- [x] Goal 5: Route messaging and template calls through the connected tenant credential, with manual-token fallback.
- [x] Goal 6: Subscribe each connected WABA to the app webhook and add the phone registration step with a non-persisted PIN.
- [x] Goal 7: Track tenant token expiry and add optional provider System User attachment support.
- [x] Goal 8: Run typecheck, lint, utility checks, diff validation, Prisma generation, and synchronize the updated schema with the configured database.
- [x] Goal 9: Audit the production configuration gate and add a regression check for encrypted tenant credentials.
- [x] Goal 10: Validate the selected WABA against the Meta Business Portfolio when Embedded Signup provides `business_id`.
- [x] Goal 11: Add a production smoke gate that detects the old landing fallback instead of the protected API route.
- [x] Goal 12: Align the browser launch payload with Meta Embedded Signup v4 and cover the v4 WABA session-event variants.
- [ ] Goal: Record an English end-to-end screencast showing Meta login, consent, business/WABA selection, connection, and the resulting CRM state.
- [ ] Goal: Resubmit only after the video matches the actual production flow and the server-to-server token model is explicitly documented.

## Pending production activation

- [ ] Goal: Rotate the credential embedded in the local Git remote before pushing changes.
- [x] Goal: Commit/deploy the current Embedded Signup implementation to the Vercel project; production smoke check passes.
- [x] Goal: Configure the Meta App ID, Embedded Signup Config ID, Meta App Secret, and encryption key in Vercel (reported by the user; secret values were not inspected).
- [ ] Goal: Configure the provider System User ID and token when the `business_management` access is approved.
- [x] Goal: Apply the Prisma schema with `npm run db:push` against the configured Neon database.
- [ ] Goal: Complete one real production Embedded Signup connection with a review-safe WABA and phone number.
- [x] Goal: Run release-readiness validation against the published Embedded Signup implementation.
