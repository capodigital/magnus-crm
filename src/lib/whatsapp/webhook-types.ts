import type { Prisma } from '../../../prisma/generated/prisma'
import { MessageKind } from '../../../prisma/generated/prisma'

type MetaWebhookContact = {
  profile?: {
    name?: string
  }
  wa_id?: string
}

type MetaWebhookMessage = {
  from?: string
  id?: string
  timestamp?: string
  type?: string
  text?: {
    body?: string
  }
  image?: {
    caption?: string
    mime_type?: string
  }
  document?: {
    caption?: string
    mime_type?: string
  }
  audio?: {
    mime_type?: string
  }
  video?: {
    caption?: string
    mime_type?: string
  }
}

type MetaWebhookStatus = {
  id?: string
  status?: string
  timestamp?: string
  recipient_id?: string
}

type MetaWebhookValue = {
  messaging_product?: string
  metadata?: {
    display_phone_number?: string
    phone_number_id?: string
  }
  contacts?: MetaWebhookContact[]
  messages?: MetaWebhookMessage[]
  statuses?: MetaWebhookStatus[]
}

type MetaWebhookChange = {
  value?: MetaWebhookValue
  field?: string
}

type MetaWebhookEntry = {
  id?: string
  changes?: MetaWebhookChange[]
}

export type WhatsappWebhookPayload = {
  object?: string
  entry?: MetaWebhookEntry[]
}

type BaseExtractedWhatsappEvent = {
  objectType: string
  entryId: string | null
  changeField: string
  wabaId: string | null
  phoneNumberId: string | null
  displayPhoneNumber: string | null
  eventTimestamp: Date | null
  rawPayload: Prisma.InputJsonObject
}

export type ExtractedWhatsappMessageEvent = BaseExtractedWhatsappEvent & {
  eventType: 'MESSAGE'
  eventKey: string
  externalMessageId: string
  contactWaId: string | null
  contactName: string | null
  senderPhone: string | null
  messageType: string
  messageKind: MessageKind
  bodyText: string | null
  mediaMimeType: string | null
}

export type ExtractedWhatsappStatusEvent = BaseExtractedWhatsappEvent & {
  eventType: 'STATUS'
  eventKey: string
  externalMessageId: string | null
  externalStatus: string | null
  contactWaId: string | null
}

export type ExtractedWhatsappWebhookEvent = ExtractedWhatsappMessageEvent | ExtractedWhatsappStatusEvent

const parseUnixTimestamp = (value?: string | null) => {
  if (!value) return null

  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return null

  return new Date(numericValue * 1000)
}

const normalizeOptionalString = (value?: string | null) => {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : null
}

const resolveMessageKind = (messageType?: string | null) => {
  switch (messageType) {
    case 'image':
      return MessageKind.IMAGE
    case 'document':
      return MessageKind.DOCUMENT
    case 'audio':
      return MessageKind.AUDIO
    case 'video':
      return MessageKind.VIDEO
    case 'text':
      return MessageKind.TEXT
    default:
      return MessageKind.SYSTEM
  }
}

const resolveBodyText = (message: MetaWebhookMessage) => {
  switch (message.type) {
    case 'text':
      return normalizeOptionalString(message.text?.body)
    case 'image':
      return normalizeOptionalString(message.image?.caption)
    case 'document':
      return normalizeOptionalString(message.document?.caption)
    case 'video':
      return normalizeOptionalString(message.video?.caption)
    default:
      return null
  }
}

const resolveMediaMimeType = (message: MetaWebhookMessage) => {
  switch (message.type) {
    case 'image':
      return normalizeOptionalString(message.image?.mime_type)
    case 'document':
      return normalizeOptionalString(message.document?.mime_type)
    case 'audio':
      return normalizeOptionalString(message.audio?.mime_type)
    case 'video':
      return normalizeOptionalString(message.video?.mime_type)
    default:
      return null
  }
}

const buildMessagePayload = (
  entry: MetaWebhookEntry,
  change: MetaWebhookChange,
  value: MetaWebhookValue,
  message: MetaWebhookMessage
) => ({
  entryId: entry.id ?? null,
  field: change.field ?? null,
  metadata: value.metadata ?? null,
  contacts: value.contacts ?? [],
  message
}) as Prisma.InputJsonObject

const buildStatusPayload = (
  entry: MetaWebhookEntry,
  change: MetaWebhookChange,
  value: MetaWebhookValue,
  status: MetaWebhookStatus
) => ({
  entryId: entry.id ?? null,
  field: change.field ?? null,
  metadata: value.metadata ?? null,
  status
}) as Prisma.InputJsonObject

export const extractWhatsappWebhookEvents = (payload: WhatsappWebhookPayload): ExtractedWhatsappWebhookEvent[] => {
  const extractedEvents: ExtractedWhatsappWebhookEvent[] = []
  const objectType = normalizeOptionalString(payload.object) ?? 'unknown'

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value

      if (!value) continue

      const entryId = normalizeOptionalString(entry.id)
      const changeField = normalizeOptionalString(change.field) ?? 'unknown'
      const wabaId = normalizeOptionalString(entry.id)
      const phoneNumberId = normalizeOptionalString(value.metadata?.phone_number_id)
      const displayPhoneNumber = normalizeOptionalString(value.metadata?.display_phone_number)
      const primaryContact = value.contacts?.[0]
      const contactWaId = normalizeOptionalString(primaryContact?.wa_id)
      const contactName = normalizeOptionalString(primaryContact?.profile?.name)

      for (const message of value.messages ?? []) {
        const externalMessageId = normalizeOptionalString(message.id)

        if (!externalMessageId) continue

        extractedEvents.push({
          eventType: 'MESSAGE',
          eventKey: `message:${externalMessageId}`,
          objectType,
          entryId,
          changeField,
          wabaId,
          phoneNumberId,
          displayPhoneNumber,
          externalMessageId,
          contactWaId,
          contactName,
          senderPhone: normalizeOptionalString(message.from),
          messageType: normalizeOptionalString(message.type) ?? 'unknown',
          messageKind: resolveMessageKind(message.type),
          bodyText: resolveBodyText(message),
          mediaMimeType: resolveMediaMimeType(message),
          eventTimestamp: parseUnixTimestamp(message.timestamp),
          rawPayload: buildMessagePayload(entry, change, value, message)
        })
      }

      for (const status of value.statuses ?? []) {
        const statusMessageId = normalizeOptionalString(status.id)
        const statusCode = normalizeOptionalString(status.status)
        const timestamp = parseUnixTimestamp(status.timestamp)

        const fallbackKey = [
          statusMessageId ?? 'unknown-message',
          statusCode ?? 'unknown-status',
          status.timestamp ?? 'unknown-timestamp'
        ].join(':')

        extractedEvents.push({
          eventType: 'STATUS',
          eventKey: `status:${fallbackKey}`,
          objectType,
          entryId,
          changeField,
          wabaId,
          phoneNumberId,
          displayPhoneNumber,
          externalMessageId: statusMessageId,
          externalStatus: statusCode,
          contactWaId: normalizeOptionalString(status.recipient_id),
          eventTimestamp: timestamp,
          rawPayload: buildStatusPayload(entry, change, value, status)
        })
      }

    }
  }

  return extractedEvents
}
