import 'server-only'

export type MetaMessageResponse = {
  messaging_product?: string
  contacts?: Array<{
    input?: string
    wa_id?: string
  }>
  messages?: Array<{
    id?: string
  }>
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    error_data?: {
      details?: string
    }
  }
}

export type MetaEmbeddedSignupTokenResponse = {
  access_token?: string
  token_type?: string
  expires_in?: number
  error?: MetaMessageResponse['error']
}

export class WhatsappMetaApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 502) {
    super(message)
    this.name = 'WhatsappMetaApiError'
    this.statusCode = statusCode
  }
}

export const getMetaAccessToken = () => {
  const accessToken = process.env.META_SYSTEM_USER_ACCESS_TOKEN?.trim() || process.env.META_ACCESS_TOKEN?.trim()

  if (!accessToken) {
    throw new WhatsappMetaApiError(
      'META_ACCESS_TOKEN o META_SYSTEM_USER_ACCESS_TOKEN no esta configurado en el servidor.',
      503
    )
  }

  return accessToken
}

export const getMetaAppId = () => {
  const appId = process.env.META_APP_ID?.trim()

  if (!appId) {
    throw new WhatsappMetaApiError('META_APP_ID no esta configurado en el servidor.', 503)
  }

  return appId
}

const getMetaAppSecret = () => {
  const appSecret = process.env.META_APP_SECRET?.trim()

  if (!appSecret) {
    throw new WhatsappMetaApiError('META_APP_SECRET no esta configurado en el servidor.', 503)
  }

  return appSecret
}

export const getGraphApiVersion = () => process.env.META_GRAPH_API_VERSION?.trim() || 'v26.0'

const getMetaErrorMessage = (payload: MetaMessageResponse) => {
  const message = payload.error?.message?.trim()
  const code = payload.error?.code
  const details = payload.error?.error_data?.details?.trim()
  const suffix = [code ? `[${code}]` : null, details ? ` ${details}` : null].filter(Boolean).join('')

  if (!message)
    return suffix
      ? `Meta no pudo procesar la solicitud de WhatsApp${suffix}.`
      : 'Meta no pudo procesar la solicitud de WhatsApp.'

  return `Meta no pudo procesar la solicitud de WhatsApp${suffix}: ${message}${details ? ` (${details})` : ''}`
}

export const requestMetaApi = async <T = MetaMessageResponse>(
  path: string,
  init: RequestInit = {},
  accessToken = getMetaAccessToken()
) => {
  let response: Response

  try {
    response = await fetch(`https://graph.facebook.com/${getGraphApiVersion()}/${path.replace(/^\/+/, '')}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      ...init,
      cache: 'no-store'
    })
  } catch {
    throw new WhatsappMetaApiError('No pudimos conectar con WhatsApp para enviar el mensaje.', 502)
  }

  const payload = (await response.json().catch(() => null)) as MetaMessageResponse | null

  if (!response.ok || !payload) {
    throw new WhatsappMetaApiError(
      payload ? getMetaErrorMessage(payload) : 'Meta devolvio una respuesta invalida.',
      502
    )
  }

  return payload as T
}

export const postMetaMessage = async (phoneNumberId: string, message: Record<string, unknown>) => {
  return requestMetaApi<MetaMessageResponse>(`${encodeURIComponent(phoneNumberId)}/messages`, {
    method: 'POST',
    body: JSON.stringify(message)
  })
}

export const postMetaMessageWithAccessToken = async (
  phoneNumberId: string,
  message: Record<string, unknown>,
  accessToken: string
) => {
  return requestMetaApi<MetaMessageResponse>(
    `${encodeURIComponent(phoneNumberId)}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(message)
    },
    accessToken
  )
}

export const exchangeMetaEmbeddedSignupCode = async (code: string) => {
  const params = new URLSearchParams({
    client_id: getMetaAppId(),
    client_secret: getMetaAppSecret(),
    code
  })

  let response: Response

  try {
    response = await fetch(
      `https://graph.facebook.com/${getGraphApiVersion()}/oauth/access_token?${params.toString()}`,
      {
        method: 'GET',
        cache: 'no-store'
      }
    )
  } catch {
    throw new WhatsappMetaApiError('No pudimos conectar con Meta para completar el onboarding de WhatsApp.', 502)
  }

  const payload = (await response.json().catch(() => null)) as MetaEmbeddedSignupTokenResponse | null

  if (!response.ok || !payload?.access_token) {
    throw new WhatsappMetaApiError(
      payload ? getMetaErrorMessage(payload) : 'Meta devolvio una respuesta invalida durante el onboarding.',
      502
    )
  }

  return payload
}
