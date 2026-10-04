import 'server-only'

import { WhatsappPhoneRegistrationStatus } from '../../../prisma/generated/prisma/client'

import prisma from '@/lib/prisma'
import { requestMetaApi, WhatsappMetaApiError } from '@/lib/whatsapp/meta-client'
import { resolveMetaAccessToken } from '@/lib/whatsapp/token-vault'

type MetaPhoneRegistrationResponse = {
  success?: boolean | string
}

export class WhatsappPhoneRegistrationError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'WhatsappPhoneRegistrationError'
    this.statusCode = statusCode
  }
}

const normalizePin = (pin: string | null | undefined) => {
  const normalizedPin = pin?.trim() ?? ''

  if (!/^\d{6}$/.test(normalizedPin)) {
    throw new WhatsappPhoneRegistrationError('El PIN de WhatsApp debe tener exactamente 6 dígitos.')
  }

  return normalizedPin
}

export const registerTenantWhatsappPhone = async (input: { tenantId: string; phoneNumberId: string; pin: string }) => {
  const phoneNumberId = input.phoneNumberId.trim()
  const pin = normalizePin(input.pin)

  if (!/^\d{6,32}$/.test(phoneNumberId)) {
    throw new WhatsappPhoneRegistrationError('El Phone Number ID no tiene un formato válido.')
  }

  const phoneNumber = await prisma.whatsappPhoneNumber.findFirst({
    where: {
      tenantId: input.tenantId,
      phoneNumberId
    },
    select: {
      id: true,
      phoneNumberId: true,
      accessTokenCiphertext: true,
      accessTokenIv: true,
      accessTokenAuthTag: true,
      accessTokenExpiresAt: true
    }
  })

  if (!phoneNumber) {
    throw new WhatsappPhoneRegistrationError('El número de WhatsApp no está vinculado a este workspace.', 404)
  }

  try {
    const response = await requestMetaApi<MetaPhoneRegistrationResponse>(
      `${encodeURIComponent(phoneNumber.phoneNumberId)}/register`,
      {
        method: 'POST',
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          pin
        })
      },
      resolveMetaAccessToken(phoneNumber)
    )

    if (response.success !== true && response.success !== 'true') {
      throw new WhatsappPhoneRegistrationError('Meta no confirmó el registro del número.', 502)
    }

    await prisma.whatsappPhoneNumber.update({
      where: {
        id: phoneNumber.id
      },
      data: {
        registrationStatus: WhatsappPhoneRegistrationStatus.REGISTERED
      }
    })

    return {
      phoneNumberId: phoneNumber.phoneNumberId,
      registrationStatus: WhatsappPhoneRegistrationStatus.REGISTERED
    }
  } catch (error) {
    await prisma.whatsappPhoneNumber
      .update({
        where: {
          id: phoneNumber.id
        },
        data: {
          registrationStatus: WhatsappPhoneRegistrationStatus.FAILED
        }
      })
      .catch(() => undefined)

    if (error instanceof WhatsappPhoneRegistrationError) throw error

    if (error instanceof WhatsappMetaApiError) {
      throw new WhatsappPhoneRegistrationError(error.message, error.statusCode)
    }

    throw new WhatsappPhoneRegistrationError('No pudimos registrar el número de WhatsApp con Meta.', 502)
  }
}
