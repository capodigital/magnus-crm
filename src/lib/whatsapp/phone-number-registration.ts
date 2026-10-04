import 'server-only'

import { WhatsappConnectionSource } from '../../../prisma/generated/prisma/client'
import type { Prisma , WhatsappPhoneRegistrationStatus } from '../../../prisma/generated/prisma/client'

import prisma from '@/lib/prisma'
import { encryptMetaAccessToken } from '@/lib/whatsapp/token-vault'

export type RegisterWhatsappPhoneNumberInput = {
  tenantSlug: string
  wabaId: string
  phoneNumberId: string
  businessId?: string | null
  displayPhoneNumber?: string | null
  verifiedName?: string | null
  qualityRating?: string | null
  codeVerificationStatus?: string | null
  accessToken?: string | null
  accessTokenExpiresAt?: Date | null
  registrationStatus?: WhatsappPhoneRegistrationStatus
  connectionSource?: WhatsappConnectionSource
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
  businessId: string | null
  displayPhoneNumber: string | null
  connectionSource: WhatsappConnectionSource
  connectedAt: Date | null
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
    businessId?: string | null
    displayPhoneNumber?: string | null
    verifiedName?: string | null
    qualityRating?: string | null
    codeVerificationStatus?: string | null
    accessToken?: string | null
    accessTokenExpiresAt?: Date | null
    registrationStatus?: WhatsappPhoneRegistrationStatus
    connectionSource?: WhatsappConnectionSource
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

  const encryptedToken = input.accessToken ? encryptMetaAccessToken(input.accessToken) : null

  const connectionData = encryptedToken
    ? {
        businessId: input.businessId ?? null,
        ...encryptedToken,
        accessTokenExpiresAt: input.accessTokenExpiresAt ?? null,
        ...(input.registrationStatus ? { registrationStatus: input.registrationStatus } : {}),
        connectionSource: input.connectionSource ?? WhatsappConnectionSource.EMBEDDED_SIGNUP,
        connectedAt: new Date()
      }
    : {}

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
          codeVerificationStatus: input.codeVerificationStatus,
          ...connectionData
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
          codeVerificationStatus: input.codeVerificationStatus,
          ...connectionData
        }
      })

  return {
    tenantId: input.tenantId,
    tenantSlug: input.tenantSlug,
    whatsappPhoneNumberId: phoneBinding.id,
    phoneNumberId: phoneBinding.phoneNumberId,
    wabaId: phoneBinding.wabaId,
    businessId: phoneBinding.businessId,
    displayPhoneNumber: phoneBinding.displayPhoneNumber,
    connectionSource: phoneBinding.connectionSource,
    connectedAt: phoneBinding.connectedAt,
    created: existingPhoneNumber === null
  }
}

export const registerTenantWhatsappPhoneNumber = async (
  input: RegisterTenantWhatsappPhoneNumberInput
): Promise<RegisterWhatsappPhoneNumberResult> => {
  const tenantId = normalizeRequiredValue(input.tenantId, 'tenantId')
  const wabaId = normalizeRequiredValue(input.wabaId, 'META_WABA_ID')
  const phoneNumberId = normalizeRequiredValue(input.phoneNumberId, 'META_PHONE_NUMBER_ID')
  const businessId = normalizeOptionalValue(input.businessId)
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
        businessId,
        displayPhoneNumber,
        verifiedName,
        qualityRating,
        codeVerificationStatus,
        accessToken: input.accessToken,
        accessTokenExpiresAt: input.accessTokenExpiresAt,
        registrationStatus: input.registrationStatus,
        connectionSource: input.connectionSource
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
  const businessId = normalizeOptionalValue(input.businessId)
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
        businessId,
        displayPhoneNumber,
        verifiedName,
        qualityRating,
        codeVerificationStatus,
        accessToken: input.accessToken,
        accessTokenExpiresAt: input.accessTokenExpiresAt,
        registrationStatus: input.registrationStatus,
        connectionSource: input.connectionSource
      },
      tx
    )
  })
}
