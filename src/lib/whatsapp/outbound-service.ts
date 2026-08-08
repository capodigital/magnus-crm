import 'server-only'

import { ChannelType, ConversationStatus, MessageDirection, MessageKind } from '../../../prisma/generated/prisma'
import type { Prisma } from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'

const MAX_TEXT_LENGTH = 4096

type MetaSendMessageResponse = {
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

type SendWhatsappTextInput = {
  tenantId: string
  conversationId: string
  body: string
}

export type SendWhatsappTextResult = {
  conversationId: string
  messageId: string
  metaMessageId: string
  recipient: string
}

export class WhatsappOutboundError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'WhatsappOutboundError'
    this.statusCode = statusCode
  }
}

const normalizeBody = (body: string) => {
  const normalizedBody = body.trim()

  if (!normalizedBody) {
    throw new WhatsappOutboundError('Escribe un mensaje antes de enviarlo.')
  }

  if (normalizedBody.length > MAX_TEXT_LENGTH) {
    throw new WhatsappOutboundError(`El mensaje no puede superar los ${MAX_TEXT_LENGTH} caracteres.`)
  }

  return normalizedBody
}

const normalizeRecipient = (whatsappWaId?: string | null, phoneE164?: string | null) => {
  const recipient = whatsappWaId?.trim() || phoneE164?.replace(/\D/g, '')

  if (!recipient) {
    throw new WhatsappOutboundError('El contacto no tiene un numero de WhatsApp valido.')
  }

  return recipient
}

const getAccessToken = () => {
  const accessToken = process.env.META_ACCESS_TOKEN?.trim()

  if (!accessToken) {
    throw new WhatsappOutboundError('META_ACCESS_TOKEN no esta configurado en el servidor.', 503)
  }

  return accessToken
}

const getGraphApiVersion = () => process.env.META_GRAPH_API_VERSION?.trim() || 'v25.0'

const getMetaErrorMessage = (payload: MetaSendMessageResponse) => {
  const message = payload.error?.message?.trim()

  return message ? `Meta no pudo enviar el mensaje: ${message}` : 'Meta no pudo enviar el mensaje.'
}

export const sendWhatsappTextMessage = async (
  input: SendWhatsappTextInput
): Promise<SendWhatsappTextResult> => {
  const body = normalizeBody(input.body)
  const accessToken = getAccessToken()

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: input.conversationId,
      tenantId: input.tenantId,
      channel: ChannelType.WHATSAPP,
      status: {
        not: ConversationStatus.SPAM
      }
    },
    select: {
      id: true,
      contact: {
        select: {
          whatsappWaId: true,
          phoneE164: true
        }
      },
      whatsappPhoneNumber: {
        select: {
          phoneNumberId: true
        }
      },
      messages: {
        where: {
          direction: MessageDirection.INBOUND,
          metaMessageId: {
            not: null
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1,
        select: {
          metaMessageId: true
        }
      }
    }
  })

  if (!conversation) {
    throw new WhatsappOutboundError('La conversacion no existe o no pertenece a este workspace.', 404)
  }

  const phoneNumberId = conversation.whatsappPhoneNumber?.phoneNumberId

  if (!phoneNumberId) {
    throw new WhatsappOutboundError('La conversacion no tiene un numero de WhatsApp vinculado.')
  }

  const recipient = normalizeRecipient(conversation.contact.whatsappWaId, conversation.contact.phoneE164)
  const latestInboundMetaMessageId = conversation.messages[0]?.metaMessageId

  const response = await fetch(
    `https://graph.facebook.com/${getGraphApiVersion()}/${encodeURIComponent(phoneNumberId)}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        ...(latestInboundMetaMessageId ? { context: { message_id: latestInboundMetaMessageId } } : {}),
        type: 'text',
        text: {
          preview_url: false,
          body
        }
      }),
      cache: 'no-store'
    }
  )

  const payload = (await response.json().catch(() => null)) as MetaSendMessageResponse | null

  if (!response.ok || !payload) {
    throw new WhatsappOutboundError(payload ? getMetaErrorMessage(payload) : 'Meta devolvio una respuesta invalida.', 502)
  }

  const metaMessageId = payload.messages?.[0]?.id?.trim()

  if (!metaMessageId) {
    throw new WhatsappOutboundError(getMetaErrorMessage(payload), 502)
  }

  const createdAt = new Date()

  const rawPayload = {
    messaging_product: payload.messaging_product ?? 'whatsapp',
    contacts: payload.contacts ?? [],
    messages: [{ id: metaMessageId }]
  } as Prisma.InputJsonValue

  const message = await prisma.$transaction(async tx => {
    const currentConversation = await tx.conversation.findFirst({
      where: {
        id: conversation.id,
        tenantId: input.tenantId,
        channel: ChannelType.WHATSAPP
      },
      select: {
        id: true,
        leadId: true
      }
    })

    if (!currentConversation) {
      throw new WhatsappOutboundError('La conversacion ya no esta disponible para guardar la respuesta.', 409)
    }

    const createdMessage = await tx.message.create({
      data: {
        tenantId: input.tenantId,
        conversationId: currentConversation.id,
        direction: MessageDirection.OUTBOUND,
        kind: MessageKind.TEXT,
        bodyText: body,
        metaMessageId,
        rawPayload,
        createdAt
      },
      select: {
        id: true
      }
    })

    await tx.conversation.update({
      where: {
        id: currentConversation.id
      },
      data: {
        lastMessageAt: createdAt
      }
    })

    if (currentConversation.leadId) {
      await tx.lead.updateMany({
        where: {
          id: currentConversation.leadId,
          tenantId: input.tenantId
        },
        data: {
          lastOutboundAt: createdAt
        }
      })
    }

    return createdMessage
  })

  return {
    conversationId: conversation.id,
    messageId: message.id,
    metaMessageId,
    recipient
  }
}
