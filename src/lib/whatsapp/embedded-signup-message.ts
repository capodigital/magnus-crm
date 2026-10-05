export type EmbeddedSignupSessionInfo = {
  wabaId: string
  phoneNumberId?: string | null
  businessId?: string | null
  skipPhoneRegistration?: boolean
}

type EmbeddedSignupMessage = {
  type?: string
  event?: string
  data?: Record<string, unknown> | string
  waba_id?: string
  phone_number_id?: string
  business_id?: string
  error_message?: string
}

export type EmbeddedSignupMessageResult = EmbeddedSignupSessionInfo | { error: string } | null

export const parseEmbeddedSignupMessage = (value: unknown): EmbeddedSignupMessageResult => {
  let message = value as EmbeddedSignupMessage

  if (typeof value === 'string') {
    try {
      message = JSON.parse(value) as EmbeddedSignupMessage
    } catch {
      return null
    }
  }

  if (!message || typeof message !== 'object') return null

  let nestedData = message.data ?? {}

  if (typeof nestedData === 'string') {
    try {
      nestedData = JSON.parse(nestedData) as Record<string, unknown>
    } catch {
      nestedData = {}
    }
  }

  const eventName = message.event ?? String(nestedData.event ?? '')
  const eventType = message.type ?? String(nestedData.type ?? '')
  const isEmbeddedSignupEvent = eventType === 'WA_EMBEDDED_SIGNUP' || eventName === 'WA_EMBEDDED_SIGNUP'

  if (!isEmbeddedSignupEvent) return null

  if (eventName === 'CANCEL') return { error: 'La conexión con Meta fue cancelada.' }

  const errorMessage = message.error_message ?? String(nestedData.error_message ?? '')

  if (errorMessage) return { error: errorMessage }

  const wabaIds = Array.isArray(nestedData.waba_ids)
    ? nestedData.waba_ids.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : []

  const primaryWabaId = nestedData.waba_id ?? message.waba_id ?? (wabaIds.length === 1 ? wabaIds[0] : '')
  const wabaId = String(primaryWabaId)
  const phoneNumberId = String(nestedData.phone_number_id ?? message.phone_number_id ?? '')
  const businessId = String(nestedData.business_id ?? message.business_id ?? '')

  if (!wabaId) {
    if (wabaIds.length > 1) {
      return { error: 'Meta devolvió varios WABA. Selecciona una configuración de un solo WABA e inténtalo nuevamente.' }
    }

    return null
  }

  return {
    wabaId,
    phoneNumberId: phoneNumberId || null,
    businessId: businessId || null,
    skipPhoneRegistration: eventName === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'
  }
}
