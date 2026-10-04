import 'server-only'

import { ChannelType, ConversationStatus, MessageDirection, MessageKind } from '../../../prisma/generated/prisma'
import type { Prisma } from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'
import { postMetaMessageWithAccessToken, WhatsappMetaApiError } from '@/lib/whatsapp/meta-client'
import { getWhatsappReplyWindow } from '@/lib/whatsapp/reply-window'
import { resolveMetaAccessToken } from '@/lib/whatsapp/token-vault'

const MAX_TEXT_LENGTH = 4096

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
  code: string | null

  constructor(message: string, statusCode = 400, code: string | null = null) {
    super(message)
    this.name = 'WhatsappOutboundError'
    this.statusCode = statusCode
    this.code = code
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

export const sendWhatsappTextMessage = async (input: SendWhatsappTextInput): Promise<SendWhatsappTextResult> => {
  const body = normalizeBody(input.body)

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
      lastInboundAt: true,
      contact: {
        select: {
          whatsappWaId: true,
          phoneE164: true
        }
      },
      whatsappPhoneNumber: {
        select: {
          phoneNumberId: true,
          accessTokenCiphertext: true,
          accessTokenIv: true,
          accessTokenAuthTag: true,
          accessTokenExpiresAt: true
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
          metaMessageId: true,
          createdAt: true
        }
      }
    }
  })

  if (!conversation) {
    throw new WhatsappOutboundError('La conversacion no existe o no pertenece a este workspace.', 404)
  }

  const lastInboundAt = conversation.lastInboundAt ?? conversation.messages[0]?.createdAt ?? null
  const replyWindow = getWhatsappReplyWindow(lastInboundAt)

  if (!replyWindow.isOpen) {
    throw new WhatsappOutboundError(
      'La ventana de atencion de 24 horas termino. Selecciona una plantilla aprobada para contactar a este cliente.',
      409,
      'REPLY_WINDOW_CLOSED'
    )
  }

  const phoneNumberId = conversation.whatsappPhoneNumber?.phoneNumberId

  if (!phoneNumberId) {
    throw new WhatsappOutboundError('La conversacion no tiene un numero de WhatsApp vinculado.')
  }

  const recipient = normalizeRecipient(conversation.contact.whatsappWaId, conversation.contact.phoneE164)
  const latestInboundMetaMessageId = conversation.messages[0]?.metaMessageId

  let payload

  try {
    payload = await postMetaMessageWithAccessToken(
      phoneNumberId,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        ...(latestInboundMetaMessageId ? { context: { message_id: latestInboundMetaMessageId } } : {}),
        type: 'text',
        text: {
          preview_url: false,
          body
        }
      },
      resolveMetaAccessToken(conversation.whatsappPhoneNumber)
    )
  } catch (error) {
    if (error instanceof WhatsappMetaApiError) {
      throw new WhatsappOutboundError(error.message, error.statusCode)
    }

    throw error
  }

  const metaMessageId = payload.messages?.[0]?.id?.trim()

  if (!metaMessageId) {
    throw new WhatsappOutboundError('Meta no devolvio un identificador de mensaje valido.', 502)
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
