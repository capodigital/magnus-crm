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
  }
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
  const accessToken = process.env.META_ACCESS_TOKEN?.trim()

  if (!accessToken) {
    throw new WhatsappMetaApiError('META_ACCESS_TOKEN no esta configurado en el servidor.', 503)
  }

  return accessToken
}

export const getGraphApiVersion = () => process.env.META_GRAPH_API_VERSION?.trim() || 'v25.0'

const getMetaErrorMessage = (payload: MetaMessageResponse) => {
  const message = payload.error?.message?.trim()
  const code = payload.error?.code

  if (!message) return 'Meta no pudo procesar el mensaje.'

  return code ? `Meta no pudo procesar el mensaje [${code}]: ${message}` : `Meta no pudo procesar el mensaje: ${message}`
}

export const requestMetaApi = async <T = MetaMessageResponse>(path: string, init: RequestInit = {}) => {
  let response: Response

  try {
    response = await fetch(
      `https://graph.facebook.com/${getGraphApiVersion()}/${path.replace(/^\/+/, '')}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getMetaAccessToken()}`,
          'Content-Type': 'application/json'
        },
        ...init,
        cache: 'no-store'
      }
    )
  } catch {
    throw new WhatsappMetaApiError('No pudimos conectar con WhatsApp para enviar el mensaje.', 502)
  }

  const payload = (await response.json().catch(() => null)) as MetaMessageResponse | null

  if (!response.ok || !payload) {
    throw new WhatsappMetaApiError(payload ? getMetaErrorMessage(payload) : 'Meta devolvio una respuesta invalida.', 502)
  }

  return payload as T
}

export const postMetaMessage = async (phoneNumberId: string, message: Record<string, unknown>) => {
  return requestMetaApi<MetaMessageResponse>(`${encodeURIComponent(phoneNumberId)}/messages`, {
    method: 'POST',
    body: JSON.stringify(message)
  })
}
