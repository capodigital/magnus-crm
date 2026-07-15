import 'server-only'

import {
  WhatsappWebhookProcessingStatus,
  WhatsappWebhookEventType
} from '../../../prisma/generated/prisma'

import { upsertInboundWhatsappMessage } from '@/lib/crm/inbox-repository'
import {
  findWhatsappPhoneNumberBinding,
  getOrCreateWhatsappWebhookEvent,
  updateWhatsappWebhookEventProcessing
} from '@/lib/whatsapp/webhook-event-store'
import {
  extractWhatsappWebhookEvents,
  type ExtractedWhatsappMessageEvent,
  type WhatsappWebhookPayload
} from '@/lib/whatsapp/webhook-types'

export type ProcessWhatsappWebhookPayloadResult = {
  receivedEvents: number
  storedEvents: number
  duplicateEvents: number
  ignoredEvents: number
  unmappedPhoneNumbers: number
  processedMessages: number
  storedStatuses: number
}

const buildThreadKey = (event: ExtractedWhatsappMessageEvent) => {
  const participantKey = event.contactWaId ?? event.senderPhone

  if (!event.phoneNumberId || !participantKey) {
    return null
  }

  return `${event.phoneNumberId}:${participantKey}`
}

const markEventProcessing = async (
  tenantId: string,
  eventKey: string,
  processingStatus: WhatsappWebhookProcessingStatus,
  errorMessage?: string | null
) => {
  await updateWhatsappWebhookEventProcessing(tenantId, eventKey, {
    processingStatus,
    processedAt: new Date(),
    errorMessage: errorMessage ?? null
  })
}

const processMessageEvent = async (event: ExtractedWhatsappMessageEvent, tenantId: string, whatsappPhoneNumberId: string) => {
  const threadKey = buildThreadKey(event)

  if (!threadKey) {
    throw new Error('Inbound WhatsApp message is missing the phone_number_id or participant identifier.')
  }

  const contactWaId = event.contactWaId ?? event.senderPhone

  if (!contactWaId) {
    throw new Error('Inbound WhatsApp message is missing the contact wa_id/from value.')
  }

  return upsertInboundWhatsappMessage({
    tenantId,
    whatsappPhoneNumberId,
    externalThreadKey: threadKey,
    externalMessageId: event.externalMessageId,
    contactWaId,
    contactName: event.contactName,
    senderPhone: event.senderPhone,
    bodyText: event.bodyText,
    mediaMimeType: event.mediaMimeType,
    messageKind: event.messageKind,
    occurredAt: event.eventTimestamp ?? new Date(),
    rawPayload: event.rawPayload
  })
}

export const processWhatsappWebhookPayload = async (
  payload: WhatsappWebhookPayload
): Promise<ProcessWhatsappWebhookPayloadResult> => {
  const extractedEvents = extractWhatsappWebhookEvents(payload)

  const result: ProcessWhatsappWebhookPayloadResult = {
    receivedEvents: extractedEvents.length,
    storedEvents: 0,
    duplicateEvents: 0,
    ignoredEvents: 0,
    unmappedPhoneNumbers: 0,
    processedMessages: 0,
    storedStatuses: 0
  }

  for (const event of extractedEvents) {
    if (!event.phoneNumberId) {
      result.ignoredEvents += 1
      continue
    }

    const phoneNumberBinding = await findWhatsappPhoneNumberBinding(event.phoneNumberId)

    if (!phoneNumberBinding) {
      result.unmappedPhoneNumbers += 1

      continue
    }

    const persistedEvent = await getOrCreateWhatsappWebhookEvent({
      tenantId: phoneNumberBinding.tenantId,
      whatsappPhoneNumberId: phoneNumberBinding.id,
      eventType: event.eventType === 'MESSAGE' ? WhatsappWebhookEventType.MESSAGE : WhatsappWebhookEventType.STATUS,
      objectType: event.objectType,
      entryId: event.entryId,
      changeField: event.changeField,
      eventKey: event.eventKey,
      externalMessageId: event.externalMessageId,
      externalStatus: event.eventType === 'STATUS' ? event.externalStatus : null,
      contactWaId: event.contactWaId,
      eventTimestamp: event.eventTimestamp,
      rawPayload: event.rawPayload
    })

    if (persistedEvent.created) {
      result.storedEvents += 1
    }

    if (
      !persistedEvent.created &&
      (persistedEvent.event.processingStatus === WhatsappWebhookProcessingStatus.PROCESSED ||
        persistedEvent.event.processingStatus === WhatsappWebhookProcessingStatus.IGNORED)
    ) {
      result.duplicateEvents += 1
      continue
    }

    if (event.eventType === 'STATUS') {
      await markEventProcessing(
        phoneNumberBinding.tenantId,
        event.eventKey,
        WhatsappWebhookProcessingStatus.IGNORED,
        'Status events are stored for audit and will be reconciled in a later slice.'
      )

      result.storedStatuses += 1
      continue
    }

    try {
      await processMessageEvent(event, phoneNumberBinding.tenantId, phoneNumberBinding.id)
      await markEventProcessing(
        phoneNumberBinding.tenantId,
        event.eventKey,
        WhatsappWebhookProcessingStatus.PROCESSED
      )

      result.processedMessages += 1
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown WhatsApp inbound processing error.'

      await markEventProcessing(
        phoneNumberBinding.tenantId,
        event.eventKey,
        WhatsappWebhookProcessingStatus.FAILED,
        errorMessage
      )

      throw error
    }
  }

  return result
}
