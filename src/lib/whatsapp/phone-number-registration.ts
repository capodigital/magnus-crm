import 'server-only'

import type { Prisma } from '../../../prisma/generated/prisma/client'

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

export type RegisterTenantWhatsappPhoneNumberInput = Omit<RegisterWhatsappPhoneNumberInput, 'tenantSlug'> & {
  tenantId: string
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

const upsertWhatsappPhoneNumberForTenant = async (
  input: {
    tenantId: string
    tenantSlug: string
    wabaId: string
    phoneNumberId: string
    displayPhoneNumber?: string | null
    verifiedName?: string | null
    qualityRating?: string | null
    codeVerificationStatus?: string | null
  },
  tx: Prisma.TransactionClient
): Promise<RegisterWhatsappPhoneNumberResult> => {
  const existingPhoneNumber = await tx.whatsappPhoneNumber.findUnique({
    where: {
      phoneNumberId: input.phoneNumberId
    },
    select: {
      id: true,
      tenantId: true
    }
  })

  if (existingPhoneNumber && existingPhoneNumber.tenantId !== input.tenantId) {
    throw new Error(
      `Phone Number ID "${input.phoneNumberId}" is already linked to another tenant and will not be reassigned automatically.`
    )
  }

  const phoneBinding = existingPhoneNumber
    ? await tx.whatsappPhoneNumber.update({
        where: {
          phoneNumberId: input.phoneNumberId
        },
        data: {
          wabaId: input.wabaId,
          displayPhoneNumber: input.displayPhoneNumber,
          verifiedName: input.verifiedName,
          qualityRating: input.qualityRating,
          codeVerificationStatus: input.codeVerificationStatus
        }
      })
    : await tx.whatsappPhoneNumber.create({
        data: {
          tenantId: input.tenantId,
          wabaId: input.wabaId,
          phoneNumberId: input.phoneNumberId,
          displayPhoneNumber: input.displayPhoneNumber,
          verifiedName: input.verifiedName,
          qualityRating: input.qualityRating,
          codeVerificationStatus: input.codeVerificationStatus
        }
      })

  return {
    tenantId: input.tenantId,
    tenantSlug: input.tenantSlug,
    whatsappPhoneNumberId: phoneBinding.id,
    phoneNumberId: phoneBinding.phoneNumberId,
    wabaId: phoneBinding.wabaId,
    displayPhoneNumber: phoneBinding.displayPhoneNumber,
    created: existingPhoneNumber === null
  }
}

export const registerTenantWhatsappPhoneNumber = async (
  input: RegisterTenantWhatsappPhoneNumberInput
): Promise<RegisterWhatsappPhoneNumberResult> => {
  const tenantId = normalizeRequiredValue(input.tenantId, 'tenantId')
  const wabaId = normalizeRequiredValue(input.wabaId, 'META_WABA_ID')
  const phoneNumberId = normalizeRequiredValue(input.phoneNumberId, 'META_PHONE_NUMBER_ID')
  const displayPhoneNumber = normalizeOptionalValue(input.displayPhoneNumber)
  const verifiedName = normalizeOptionalValue(input.verifiedName)
  const qualityRating = normalizeOptionalValue(input.qualityRating)
  const codeVerificationStatus = normalizeOptionalValue(input.codeVerificationStatus)

  return prisma.$transaction(async tx => {
    const tenant = await tx.tenant.findUnique({
      where: {
        id: tenantId
      },
      select: {
        id: true,
        slug: true
      }
    })

    if (!tenant) {
      throw new Error('The active workspace does not exist.')
    }

    return upsertWhatsappPhoneNumberForTenant(
      {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        wabaId,
        phoneNumberId,
        displayPhoneNumber,
        verifiedName,
        qualityRating,
        codeVerificationStatus
      },
      tx
    )
  })
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

    return upsertWhatsappPhoneNumberForTenant(
      {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        wabaId,
        phoneNumberId,
        displayPhoneNumber,
        verifiedName,
        qualityRating,
        codeVerificationStatus
      },
      tx
    )
  })
}
