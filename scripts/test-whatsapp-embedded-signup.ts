import assert from 'node:assert/strict'

import { formatEmbeddedSignupWabaVerificationError } from '@/lib/whatsapp/embedded-signup-errors'
import { parseEmbeddedSignupMessage } from '@/lib/whatsapp/embedded-signup-message'
import { getNextMetaPageCursor } from '@/lib/whatsapp/meta-pagination'

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

assert.deepEqual(
  parseEmbeddedSignupMessage({
    type: 'WA_EMBEDDED_SIGNUP',
    event: 'FINISH',
    data: {
      waba_ids: ['123456789012345'],
      phone_number_id: '987654321098765'
    }
  }),
  {
    wabaId: '123456789012345',
    phoneNumberId: '987654321098765',
    businessId: null,
    skipPhoneRegistration: false
  }
)

assert.deepEqual(
  parseEmbeddedSignupMessage({
    type: 'WA_EMBEDDED_SIGNUP',
    event: 'FINISH',
    data: {
      waba_ids: ['123456789012345', '222222222222222']
    }
  }),
  {
    error: 'Meta devolvió varios WABA. Selecciona una configuración de un solo WABA e inténtalo nuevamente.'
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

assert.equal(
  formatEmbeddedSignupWabaVerificationError(
    'Meta no pudo procesar la solicitud de WhatsApp[200]: (#200) Requires business_management permission to manage the object'
  ),
  'Meta requiere acceso avanzado a business_management para verificar el WABA dentro del Business Portfolio. Vuelve a solicitar ese permiso en App Review y repite la conexión. Detalle de Meta: Meta no pudo procesar la solicitud de WhatsApp[200]: (#200) Requires business_management permission to manage the object'
)

assert.equal(
  formatEmbeddedSignupWabaVerificationError('Meta devolvió una respuesta inválida.'),
  'No pudimos verificar el WABA dentro del Business Portfolio: Meta devolvió una respuesta inválida.'
)

assert.equal(
  getNextMetaPageCursor(null, { paging: { next: 'https://graph.facebook.com/next', cursors: { after: 'cursor-1' } } }),
  'cursor-1'
)
assert.equal(
  getNextMetaPageCursor('cursor-1', { paging: { next: 'https://graph.facebook.com/next', cursors: { after: 'cursor-1' } } }),
  null
)
assert.equal(getNextMetaPageCursor(null, { paging: { cursors: { after: 'cursor-1' } } }), null)

console.log('WhatsApp Embedded Signup utility checks passed.')
