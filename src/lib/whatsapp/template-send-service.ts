import 'server-only'

import { ChannelType, ConversationStatus, MessageDirection, MessageKind, WhatsappTemplateStatus } from '../../../prisma/generated/prisma'
import type { Prisma } from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'
import { postMetaMessage, WhatsappMetaApiError } from '@/lib/whatsapp/meta-client'
import { WhatsappOutboundError } from '@/lib/whatsapp/outbound-service'
import { getWhatsappTemplateVariableIndexes, renderWhatsappTemplateBody } from '@/lib/whatsapp/template-utils'

type SendWhatsappTemplateInput = {
  tenantId: string
  conversationId: string
  templateId: string
  variables: string[]
}

export type SendWhatsappTemplateResult = {
  conversationId: string
  messageId: string
  metaMessageId: string
  recipient: string
  templateId: string
}

const getTemplateVariableIndexes = (bodyText: string) => {
  return getWhatsappTemplateVariableIndexes(bodyText)
}

const normalizeVariables = (bodyText: string, variables: string[]) => {
  const indexes = getTemplateVariableIndexes(bodyText)

  if (indexes.length !== variables.length) {
    throw new WhatsappOutboundError('Completa todos los campos variables de la plantilla antes de enviarla.')
  }

  return variables.map((variable, index) => {
    const normalized = variable.trim()

    if (!normalized) {
      throw new WhatsappOutboundError(`Completa el valor de la variable {{${indexes[index]}}}.`)
    }

    return normalized
  })
}

const normalizeRecipient = (whatsappWaId?: string | null, phoneE164?: string | null) => {
  const recipient = whatsappWaId?.trim() || phoneE164?.replace(/\D/g, '')

  if (!recipient) throw new WhatsappOutboundError('El contacto no tiene un numero de WhatsApp valido.')

  return recipient
}

export const sendWhatsappTemplateMessage = async (
  input: SendWhatsappTemplateInput
): Promise<SendWhatsappTemplateResult> => {
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
      leadId: true,
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
      }
    }
  })

  if (!conversation) {
    throw new WhatsappOutboundError('La conversacion no existe o no pertenece a este workspace.', 404)
  }

  const template = await prisma.whatsappMessageTemplate.findFirst({
    where: {
      id: input.templateId,
      tenantId: input.tenantId
    },
    select: {
      id: true,
      name: true,
      language: true,
      category: true,
      status: true,
      bodyText: true
    }
  })

  if (!template) {
    throw new WhatsappOutboundError('La plantilla no existe en este workspace.', 404)
  }

  if (template.status !== WhatsappTemplateStatus.APPROVED) {
    throw new WhatsappOutboundError('Esta plantilla todavía no está aprobada por Meta.', 409)
  }

  if (template.category === 'AUTHENTICATION') {
    throw new WhatsappOutboundError('Las plantillas de autenticacion se habilitaran en una version posterior.', 409)
  }

  const phoneNumberId = conversation.whatsappPhoneNumber?.phoneNumberId

  if (!phoneNumberId) {
    throw new WhatsappOutboundError('La conversacion no tiene un numero de WhatsApp vinculado.')
  }

  const normalizedVariables = normalizeVariables(template.bodyText, input.variables)
  const recipient = normalizeRecipient(conversation.contact.whatsappWaId, conversation.contact.phoneE164)

  const components = normalizedVariables.length
    ? [
        {
          type: 'body',
          parameters: normalizedVariables.map(text => ({
            type: 'text',
            text
          }))
        }
      ]
    : undefined

  let payload

  try {
    payload = await postMetaMessage(phoneNumberId, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: template.name,
        language: {
          code: template.language
        },
        ...(components ? { components } : {})
      }
    })
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

  const renderedBody = renderWhatsappTemplateBody(template.bodyText, normalizedVariables)

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
        kind: MessageKind.TEMPLATE,
        bodyText: renderedBody,
        metaMessageId,
        whatsappTemplateId: template.id,
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
    recipient,
    templateId: template.id
  }
}
