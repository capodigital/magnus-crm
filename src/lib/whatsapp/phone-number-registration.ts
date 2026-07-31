import 'server-only'

import prisma from '@/lib/prisma'

export type RegisterWhatsappPhoneNumberInput = {
  tenantSlug: string
  wabaId: string
  phoneNumberId: string
  displayPhoneNumber?: string | null
  verifiedName?: string | null
  qualityRating?: string | null
  codeVerificationStatus?: string | null
}

export type RegisterWhatsappPhoneNumberResult = {
  tenantId: string
  tenantSlug: string
  whatsappPhoneNumberId: string
  phoneNumberId: string
  wabaId: string
  displayPhoneNumber: string | null
  created: boolean
}

const normalizeRequiredValue = (value: string, fieldName: string) => {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

const normalizeOptionalValue = (value?: string | null) => {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : null
}

export const registerWhatsappPhoneNumber = async (
  input: RegisterWhatsappPhoneNumberInput
): Promise<RegisterWhatsappPhoneNumberResult> => {
  const tenantSlug = normalizeRequiredValue(input.tenantSlug, 'WHATSAPP_TENANT_SLUG').toLowerCase()
  const wabaId = normalizeRequiredValue(input.wabaId, 'META_WABA_ID')
  const phoneNumberId = normalizeRequiredValue(input.phoneNumberId, 'META_PHONE_NUMBER_ID')
  const displayPhoneNumber = normalizeOptionalValue(input.displayPhoneNumber)
  const verifiedName = normalizeOptionalValue(input.verifiedName)
  const qualityRating = normalizeOptionalValue(input.qualityRating)
  const codeVerificationStatus = normalizeOptionalValue(input.codeVerificationStatus)

  return prisma.$transaction(async tx => {
    const tenant = await tx.tenant.findUnique({
      where: {
        slug: tenantSlug
      },
      select: {
        id: true,
        slug: true
      }
    })

    if (!tenant) {
      throw new Error(`Tenant "${tenantSlug}" does not exist. Bootstrap the workspace first.`)
    }

    const existingPhoneNumber = await tx.whatsappPhoneNumber.findUnique({
      where: {
        phoneNumberId
      },
      select: {
        id: true,
        tenantId: true
      }
    })

    if (existingPhoneNumber && existingPhoneNumber.tenantId !== tenant.id) {
      throw new Error(
        `Phone Number ID "${phoneNumberId}" is already linked to another tenant and will not be reassigned automatically.`
      )
    }

    const phoneBinding = existingPhoneNumber
      ? await tx.whatsappPhoneNumber.update({
          where: {
            phoneNumberId
          },
          data: {
            wabaId,
            displayPhoneNumber,
            verifiedName,
            qualityRating,
            codeVerificationStatus
          }
        })
      : await tx.whatsappPhoneNumber.create({
          data: {
            tenantId: tenant.id,
            wabaId,
            phoneNumberId,
            displayPhoneNumber,
            verifiedName,
            qualityRating,
            codeVerificationStatus
          }
        })

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      whatsappPhoneNumberId: phoneBinding.id,
      phoneNumberId: phoneBinding.phoneNumberId,
      wabaId: phoneBinding.wabaId,
      displayPhoneNumber: phoneBinding.displayPhoneNumber,
      created: existingPhoneNumber === null
    }
  })
}
