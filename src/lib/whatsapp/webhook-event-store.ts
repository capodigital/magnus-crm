import 'server-only'

import {
  Prisma,
  type WhatsappWebhookEventType,
  type WhatsappWebhookProcessingStatus
} from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'

const whatsappPhoneNumberBindingSelect = {
  id: true,
  tenantId: true,
  wabaId: true,
  phoneNumberId: true,
  displayPhoneNumber: true
} satisfies Prisma.WhatsappPhoneNumberSelect

const storedWebhookEventSelect = {
  id: true,
  tenantId: true,
  eventKey: true,
  processingStatus: true
} satisfies Prisma.WhatsappWebhookEventSelect

export type WhatsappPhoneNumberBinding = Prisma.WhatsappPhoneNumberGetPayload<{
  select: typeof whatsappPhoneNumberBindingSelect
}>

type StoredWebhookEvent = Prisma.WhatsappWebhookEventGetPayload<{
  select: typeof storedWebhookEventSelect
}>

export type PersistWhatsappWebhookEventInput = {
  tenantId: string
  whatsappPhoneNumberId: string
  eventType: WhatsappWebhookEventType
  objectType: string
  entryId?: string | null
  changeField: string
  eventKey: string
  externalMessageId?: string | null
  externalStatus?: string | null
  contactWaId?: string | null
  eventTimestamp?: Date | null
  rawPayload: Prisma.InputJsonValue
}

type WebhookEventMutation = {
  processingStatus: WhatsappWebhookProcessingStatus
  processedAt?: Date | null
  errorMessage?: string | null
}

const isUniqueConstraintError = (error: unknown): error is Prisma.PrismaClientKnownRequestError => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false
  }

  const knownError = error as Prisma.PrismaClientKnownRequestError

  return knownError.code === 'P2002'
}

const findStoredWebhookEvent = async (tenantId: string, eventKey: string) =>
  prisma.whatsappWebhookEvent.findUnique({
    where: {
      tenantId_eventKey: {
        tenantId,
        eventKey
      }
    },
    select: storedWebhookEventSelect
  })

export const findWhatsappPhoneNumberBinding = async (phoneNumberId: string) =>
  prisma.whatsappPhoneNumber.findUnique({
    where: {
      phoneNumberId
    },
    select: whatsappPhoneNumberBindingSelect
  })

export const getOrCreateWhatsappWebhookEvent = async (
  input: PersistWhatsappWebhookEventInput
): Promise<{ event: StoredWebhookEvent; created: boolean }> => {
  const existingEvent = await findStoredWebhookEvent(input.tenantId, input.eventKey)

  if (existingEvent) {
    return {
      event: existingEvent,
      created: false
    }
  }

  try {
    const createdEvent = await prisma.whatsappWebhookEvent.create({
      data: {
        tenantId: input.tenantId,
        whatsappPhoneNumberId: input.whatsappPhoneNumberId,
        eventType: input.eventType,
        objectType: input.objectType,
        entryId: input.entryId ?? null,
        changeField: input.changeField,
        eventKey: input.eventKey,
        externalMessageId: input.externalMessageId ?? null,
        externalStatus: input.externalStatus ?? null,
        contactWaId: input.contactWaId ?? null,
        eventTimestamp: input.eventTimestamp ?? null,
        rawPayload: input.rawPayload
      },
      select: storedWebhookEventSelect
    })

    return {
      event: createdEvent,
      created: true
    }
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error
    }

    const duplicatedEvent = await findStoredWebhookEvent(input.tenantId, input.eventKey)

    if (!duplicatedEvent) {
      throw error
    }

    return {
      event: duplicatedEvent,
      created: false
    }
  }
}

export const updateWhatsappWebhookEventProcessing = async (
  tenantId: string,
  eventKey: string,
  mutation: WebhookEventMutation
) => {
  await prisma.whatsappWebhookEvent.update({
    where: {
      tenantId_eventKey: {
        tenantId,
        eventKey
      }
    },
    data: {
      processingStatus: mutation.processingStatus,
      processedAt: mutation.processedAt ?? null,
      errorMessage: mutation.errorMessage ?? null
    }
  })
}
