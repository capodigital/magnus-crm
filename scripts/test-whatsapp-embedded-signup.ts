import assert from 'node:assert/strict'

import { parseEmbeddedSignupMessage } from '@/lib/whatsapp/embedded-signup-message'

assert.deepEqual(
  parseEmbeddedSignupMessage({
    type: 'WA_EMBEDDED_SIGNUP',
    event: 'FINISH',
    data: {
      waba_id: '123456789012345',
      phone_number_id: '987654321098765',
      business_id: '111111111111111'
    }
  }),
  {
    wabaId: '123456789012345',
    phoneNumberId: '987654321098765',
    businessId: '111111111111111',
    skipPhoneRegistration: false
  }
)

assert.deepEqual(
  parseEmbeddedSignupMessage(
    JSON.stringify({
      type: 'WA_EMBEDDED_SIGNUP',
      data: JSON.stringify({
        waba_id: '123456789012345',
        phone_number_id: '987654321098765'
      })
    })
  ),
  {
    wabaId: '123456789012345',
    phoneNumberId: '987654321098765',
    businessId: null,
    skipPhoneRegistration: false
  }
)

assert.deepEqual(parseEmbeddedSignupMessage({ type: 'OTHER_EVENT' }), null)
assert.deepEqual(parseEmbeddedSignupMessage({ type: 'WA_EMBEDDED_SIGNUP', event: 'CANCEL' }), {
  error: 'La conexión con Meta fue cancelada.'
})
assert.deepEqual(
  parseEmbeddedSignupMessage({
    type: 'WA_EMBEDDED_SIGNUP',
    event: 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING',
    data: { waba_id: '123456789012345' },
    version: 3
  }),
  {
    wabaId: '123456789012345',
    phoneNumberId: null,
    businessId: null,
    skipPhoneRegistration: true
  }
)

console.log('WhatsApp Embedded Signup utility checks passed.')
