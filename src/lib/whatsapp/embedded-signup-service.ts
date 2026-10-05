import 'server-only'

import { WhatsappConnectionSource, WhatsappPhoneRegistrationStatus } from '../../../prisma/generated/prisma/client'

import { type EmbeddedSignupSessionInfo } from '@/lib/whatsapp/embedded-signup-message'
import { formatEmbeddedSignupWabaVerificationError } from '@/lib/whatsapp/embedded-signup-errors'
import { exchangeMetaEmbeddedSignupCode, requestMetaApi, WhatsappMetaApiError } from '@/lib/whatsapp/meta-client'
import { registerTenantWhatsappPhoneNumber } from '@/lib/whatsapp/phone-number-registration'

type MetaWabaResponse = {
  id?: string
  name?: string
  error?: {
    message?: string
  }
}

type MetaPhoneNumberResponse = {
  id?: string
  display_phone_number?: string
  verified_name?: string
  quality_rating?: string
  code_verification_status?: string
  error?: {
    message?: string
  }
}

type MetaPhoneNumberListResponse = {
  data?: MetaPhoneNumberResponse[]
}

type MetaBusinessWabaListResponse = {
  data?: Array<{
    id?: string
    name?: string
  }>
}

type MetaSubscribeResponse = {
  success?: boolean
  error?: {
    message?: string
  }
}

export class EmbeddedSignupError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'EmbeddedSignupError'
    this.statusCode = statusCode
  }
}

function normalizeId(value: string | null | undefined, fieldName: string): string
function normalizeId(value: string | null | undefined, fieldName: string, required: false): string | null
function normalizeId(value: string | null | undefined, fieldName: string, required = true) {
  const normalizedValue = value?.trim() ?? ''

  if (!normalizedValue && !required) return null

  if (!/^\d{6,32}$/.test(normalizedValue)) {
    throw new EmbeddedSignupError(`${fieldName} no tiene un formato valido.`)
  }

  return normalizedValue
}

const normalizeCode = (value: string | null | undefined) => {
  const code = value?.trim() ?? ''

  if (!code || code.length > 4096) {
    throw new EmbeddedSignupError('Meta no devolvio un codigo de onboarding valido.')
  }

  return code
}

const discoverPhoneNumberId = async (wabaId: string, accessToken: string) => {
  let response: MetaPhoneNumberListResponse

  try {
    response = await requestMetaApi<MetaPhoneNumberListResponse>(
      `${encodeURIComponent(wabaId)}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status`,
      { method: 'GET' },
      accessToken
    )
  } catch (error) {
    if (error instanceof WhatsappMetaApiError) {
      throw new EmbeddedSignupError(error.message, error.statusCode)
    }

    throw error
  }

  const phoneNumbers = response.data ?? []

  if (phoneNumbers.length !== 1 || !phoneNumbers[0]?.id) {
    throw new EmbeddedSignupError(
      'Meta no devolvió un único número de teléfono para este WABA. Selecciona un número desde el flujo de onboarding e inténtalo nuevamente.'
    )
  }

  return phoneNumbers[0].id
}

const verifyConnectedResources = async (sessionInfo: EmbeddedSignupSessionInfo, accessToken: string) => {
  let waba: MetaWabaResponse
  let phoneNumber: MetaPhoneNumberResponse
  const phoneNumberId = sessionInfo.phoneNumberId?.trim() || (await discoverPhoneNumberId(sessionInfo.wabaId, accessToken))

  try {
    ;[waba, phoneNumber] = await Promise.all([
      requestMetaApi<MetaWabaResponse>(
        `${encodeURIComponent(sessionInfo.wabaId)}?fields=id,name`,
        { method: 'GET' },
        accessToken
      ),
      requestMetaApi<MetaPhoneNumberResponse>(
        `${encodeURIComponent(phoneNumberId)}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status`,
        { method: 'GET' },
        accessToken
      )
    ])
  } catch (error) {
    if (error instanceof WhatsappMetaApiError) {
      throw new EmbeddedSignupError(error.message, error.statusCode)
    }

    throw error
  }

  if (waba.id && waba.id !== sessionInfo.wabaId) {
    throw new EmbeddedSignupError('Meta devolvio un WhatsApp Business Account diferente al seleccionado.')
  }

  if (phoneNumber.id && phoneNumber.id !== phoneNumberId) {
    throw new EmbeddedSignupError('Meta devolvio un numero de WhatsApp diferente al seleccionado.')
  }

  return {
    phoneNumber,
    phoneNumberId
  }
}

const verifyWabaBelongsToBusiness = async (businessId: string, wabaId: string, accessToken: string) => {
  let response: MetaBusinessWabaListResponse

  try {
    response = await requestMetaApi<MetaBusinessWabaListResponse>(
      `${encodeURIComponent(businessId)}/client_whatsapp_business_accounts?fields=id,name`,
      { method: 'GET' },
      accessToken
    )
  } catch (error) {
    if (error instanceof WhatsappMetaApiError) {
      throw new EmbeddedSignupError(formatEmbeddedSignupWabaVerificationError(error.message), error.statusCode)
    }

    throw error
  }

  if (!response.data?.some(item => item.id === wabaId)) {
    throw new EmbeddedSignupError(
      'El WABA seleccionado no pertenece al Business Portfolio autorizado para este workspace.',
      403
    )
  }
}

const subscribeAppToWaba = async (wabaId: string, accessToken: string) => {
  try {
    await requestMetaApi<MetaSubscribeResponse>(
      `${encodeURIComponent(wabaId)}/subscribed_apps`,
      { method: 'POST' },
      accessToken
    )
  } catch (error) {
    if (error instanceof WhatsappMetaApiError) {
      throw new EmbeddedSignupError(
        `No pudimos suscribir el CRM a los webhooks del WABA: ${error.message}`,
        error.statusCode
      )
    }

    throw error
  }
}

const attachProviderSystemUser = async (wabaId: string) => {
  const systemUserId = process.env.META_SYSTEM_USER_ID?.trim()
  const systemUserToken = process.env.META_SYSTEM_USER_ACCESS_TOKEN?.trim()

  if (!systemUserId || !systemUserToken) return

  try {
    await requestMetaApi(
      `${encodeURIComponent(wabaId)}/assigned_users?user=${encodeURIComponent(systemUserId)}&tasks=%5B%22MANAGE%22%5D`,
      { method: 'POST' },
      systemUserToken
    )
  } catch (error) {
    if (error instanceof WhatsappMetaApiError) {
      throw new EmbeddedSignupError(
        `No pudimos asignar el System User del proveedor al WABA: ${error.message}`,
        error.statusCode
      )
    }

    throw error
  }
}

export const connectTenantWhatsappViaEmbeddedSignup = async (input: {
  tenantId: string
  code: string
  sessionInfo: EmbeddedSignupSessionInfo
}) => {
  const code = normalizeCode(input.code)
  const wabaId = normalizeId(input.sessionInfo.wabaId, 'WABA ID')

  const phoneNumberId = input.sessionInfo.phoneNumberId
    ? normalizeId(input.sessionInfo.phoneNumberId, 'Phone Number ID')
    : null

  const businessId = normalizeId(input.sessionInfo.businessId, 'Business ID', false)

  try {
    const tokenResponse = await exchangeMetaEmbeddedSignupCode(code)

    const connectedPhone = await verifyConnectedResources(
      {
        wabaId,
        phoneNumberId,
        businessId
      },
      tokenResponse.access_token as string
    )

    if (businessId) {
      await verifyWabaBelongsToBusiness(businessId, wabaId, tokenResponse.access_token as string)
    }

    await subscribeAppToWaba(wabaId, tokenResponse.access_token as string)
    await attachProviderSystemUser(wabaId)

    return registerTenantWhatsappPhoneNumber({
      tenantId: input.tenantId,
      wabaId,
      phoneNumberId: connectedPhone.phoneNumberId,
      businessId,
      displayPhoneNumber: connectedPhone.phoneNumber.display_phone_number,
      verifiedName: connectedPhone.phoneNumber.verified_name,
      qualityRating: connectedPhone.phoneNumber.quality_rating,
      codeVerificationStatus: connectedPhone.phoneNumber.code_verification_status,
      accessToken: tokenResponse.access_token,
      accessTokenExpiresAt: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1000) : null,
      registrationStatus: input.sessionInfo.skipPhoneRegistration
        ? WhatsappPhoneRegistrationStatus.REGISTERED
        : WhatsappPhoneRegistrationStatus.PENDING,
      connectionSource: WhatsappConnectionSource.EMBEDDED_SIGNUP
    })
  } catch (error) {
    if (error instanceof EmbeddedSignupError || error instanceof WhatsappMetaApiError) {
      throw error
    }

    throw new EmbeddedSignupError('No pudimos completar la conexión de WhatsApp con Meta.', 502)
  }
}
