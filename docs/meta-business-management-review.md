# Meta App Review: `business_management`

## Purpose

Magnus CRM is a multi-tenant CRM. Each workspace can connect its own customer WhatsApp Business Account through Meta Embedded Signup. The `business_management` permission is used only to verify that the WABA returned by Embedded Signup belongs to the Business Portfolio selected by the customer before the connection is stored.

## Reviewer access

- Production URL: `https://crm.magnusecosystems.com`
- Use the reviewer account and password submitted in the Meta App Review form.
- The reviewer account is an owner of the isolated review workspace `Magnus CRM - Meta Review`.
- No production customer data is required to test this flow.

## End-to-end test flow

1. Sign in to the production CRM with the reviewer account.
2. Open **Configuración > Integraciones > WhatsApp Business** (`/settings/integrations/whatsapp`) and locate **Conectar WhatsApp con Meta**.
3. Click **Conectar número desde Meta**.
4. Complete Meta Login and grant the requested access.
5. Select the Business Portfolio, WABA, and phone number used for the review.
6. Return to the CRM and confirm that the selected WABA and phone are shown as connected to the review workspace.
7. If the phone status is pending, enter a six-digit registration PIN and select **Registrar número**.
8. Confirm that the phone status changes to registered and that the workspace can continue to the WhatsApp messaging experience.

## Server-side behavior

- The browser receives only the Meta Embedded Signup code and session identifiers.
- The CRM exchanges the code server-to-server with Meta; the app secret never reaches the browser.
- When Meta provides `business_id`, the server queries `/{business_id}/client_whatsapp_business_accounts` and rejects a WABA that is not in the selected Business Portfolio.
- The exchanged credential is encrypted with AES-256-GCM before it is stored for the active tenant.
- Outbound messages, templates, and phone registration resolve the credential from the tenant-scoped phone record.
- The connected WABA is subscribed to the CRM webhook, and the provider System User is attached when its paired production configuration is present.

## Video checklist

The recording should be in English and show the complete flow, not only the Meta configuration screen:

- The reviewer account signing in to Magnus CRM.
- The **Configuración > Integraciones > WhatsApp Business** page and the Embedded Signup button.
- Meta Login and the requested consent.
- Business Portfolio, WABA, and phone selection.
- The return to Magnus CRM with the connected account visible.
- Phone registration when Meta requires it.
- The final connected state in the isolated review workspace.

Do not include access tokens, app secrets, passwords, or `.env` values in the recording.
