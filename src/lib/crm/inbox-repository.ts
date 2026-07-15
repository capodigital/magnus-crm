import 'server-only'

import {
  ChannelType,
  ConversationStatus,
  LeadSourceChannel,
  LeadStatus,
  MessageDirection,
  type Prisma,
  type MessageKind
} from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'

export type UpsertInboundWhatsappMessageInput = {
  tenantId: string
  whatsappPhoneNumberId: string
  externalThreadKey: string
  externalMessageId: string
  contactWaId: string
  contactName?: string | null
  senderPhone?: string | null
  bodyText?: string | null
  mediaMimeType?: string | null
  messageKind: MessageKind
  occurredAt: Date
  rawPayload: Prisma.InputJsonValue
}

export type UpsertInboundWhatsappMessageResult = {
  contactId: string
  leadId: string
  conversationId: string
  messageId: string
  createdLead: boolean
  createdMessage: boolean
}

const normalizeOptionalString = (value?: string | null) => {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : null
}

const normalizeWhatsappPhone = (value?: string | null) => {
  const digits = value?.replace(/\D/g, '') ?? ''

  if (!digits) {
    return {
      phoneE164: null,
      normalizedPhone: null
    }
  }

  return {
    phoneE164: `+${digits}`,
    normalizedPhone: `+${digits}`
  }
}

const splitContactName = (fullName?: string | null) => {
  const normalizedName = normalizeOptionalString(fullName)

  if (!normalizedName) {
    return {
      firstName: null,
      lastName: null,
      fullName: null
    }
  }

  const [firstName, ...rest] = normalizedName.split(/\s+/)

  return {
    firstName,
    lastName: rest.length ? rest.join(' ') : null,
    fullName: normalizedName
  }
}

const buildLeadTitle = (contactFullName?: string | null, normalizedPhone?: string | null) => {
  const suffix = contactFullName ?? normalizedPhone ?? 'contacto'

  return `Lead de WhatsApp - ${suffix}`
}

const findDefaultPipelineContext = async (tx: Prisma.TransactionClient, tenantId: string) =>
  tx.pipeline.findFirst({
    where: {
      tenantId,
      isDefault: true
    },
    select: {
      id: true,
      stages: {
        orderBy: {
          position: 'asc'
        },
        select: {
          id: true,
          isFinal: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

export const upsertInboundWhatsappMessage = async (
  input: UpsertInboundWhatsappMessageInput
): Promise<UpsertInboundWhatsappMessageResult> => {
  const contactIdentity = normalizeWhatsappPhone(input.contactWaId ?? input.senderPhone)
  const normalizedName = splitContactName(input.contactName)

  return prisma.$transaction(async tx => {
    const existingContact = await tx.contact.findFirst({
      where: {
        tenantId: input.tenantId,
        OR: [
          {
            whatsappWaId: input.contactWaId
          },
          ...(contactIdentity.normalizedPhone
            ? [
                {
                  normalizedPhone: contactIdentity.normalizedPhone
                }
              ]
            : [])
        ]
      }
    })

    const contact =
      existingContact === null
        ? await tx.contact.create({
            data: {
              tenantId: input.tenantId,
              firstName: normalizedName.firstName,
              lastName: normalizedName.lastName,
              fullName: normalizedName.fullName,
              phoneE164: contactIdentity.phoneE164,
              normalizedPhone: contactIdentity.normalizedPhone,
              whatsappWaId: input.contactWaId,
              source: 'whatsapp',
              tags: ['whatsapp']
            }
          })
        : await tx.contact.update({
            where: {
              id: existingContact.id
            },
            data: {
              firstName: existingContact.firstName ?? normalizedName.firstName,
              lastName: existingContact.lastName ?? normalizedName.lastName,
              fullName: existingContact.fullName ?? normalizedName.fullName,
              phoneE164: existingContact.phoneE164 ?? contactIdentity.phoneE164,
              normalizedPhone: existingContact.normalizedPhone ?? contactIdentity.normalizedPhone,
              whatsappWaId: existingContact.whatsappWaId ?? input.contactWaId,
              source: existingContact.source ?? 'whatsapp',
              tags: existingContact.tags.includes('whatsapp')
                ? existingContact.tags
                : [...existingContact.tags, 'whatsapp']
            }
          })

    const defaultPipeline = await findDefaultPipelineContext(tx, input.tenantId)
    const defaultStage = defaultPipeline?.stages.find(stage => !stage.isFinal) ?? defaultPipeline?.stages[0] ?? null

    const existingLead = await tx.lead.findFirst({
      where: {
        tenantId: input.tenantId,
        contactId: contact.id,
        status: LeadStatus.OPEN
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const lead =
      existingLead === null
        ? await tx.lead.create({
            data: {
              tenantId: input.tenantId,
              contactId: contact.id,
              pipelineId: defaultPipeline?.id ?? null,
              stageId: defaultStage?.id ?? null,
              title: buildLeadTitle(contact.fullName, contact.normalizedPhone),
              sourceChannel: LeadSourceChannel.WHATSAPP,
              status: LeadStatus.OPEN,
              firstInboundAt: input.occurredAt,
              lastInboundAt: input.occurredAt
            }
          })
        : await tx.lead.update({
            where: {
              id: existingLead.id
            },
            data: {
              pipelineId: existingLead.pipelineId ?? defaultPipeline?.id ?? null,
              stageId: existingLead.stageId ?? defaultStage?.id ?? null,
              title: existingLead.title ?? buildLeadTitle(contact.fullName, contact.normalizedPhone),
              lastInboundAt: input.occurredAt
            }
          })

    const conversation = await tx.conversation.upsert({
      where: {
        tenantId_channel_externalThreadKey: {
          tenantId: input.tenantId,
          channel: ChannelType.WHATSAPP,
          externalThreadKey: input.externalThreadKey
        }
      },
      update: {
        contactId: contact.id,
        leadId: lead.id,
        status: ConversationStatus.OPEN,
        whatsappPhoneNumberId: input.whatsappPhoneNumberId,
        lastMessageAt: input.occurredAt
      },
      create: {
        tenantId: input.tenantId,
        contactId: contact.id,
        leadId: lead.id,
        channel: ChannelType.WHATSAPP,
        status: ConversationStatus.OPEN,
        externalThreadKey: input.externalThreadKey,
        whatsappPhoneNumberId: input.whatsappPhoneNumberId,
        lastMessageAt: input.occurredAt
      }
    })

    const existingMessage = await tx.message.findUnique({
      where: {
        tenantId_metaMessageId: {
          tenantId: input.tenantId,
          metaMessageId: input.externalMessageId
        }
      }
    })

    const message =
      existingMessage === null
        ? await tx.message.create({
            data: {
              tenantId: input.tenantId,
              conversationId: conversation.id,
              direction: MessageDirection.INBOUND,
              kind: input.messageKind,
              bodyText: normalizeOptionalString(input.bodyText),
              mediaMimeType: normalizeOptionalString(input.mediaMimeType),
              metaMessageId: input.externalMessageId,
              rawPayload: input.rawPayload,
              createdAt: input.occurredAt
            }
          })
        : existingMessage

    if (existingMessage !== null) {
      await tx.conversation.update({
        where: {
          id: conversation.id
        },
        data: {
          lastMessageAt: input.occurredAt
        }
      })
    }

    return {
      contactId: contact.id,
      leadId: lead.id,
      conversationId: conversation.id,
      messageId: message.id,
      createdLead: existingLead === null,
      createdMessage: existingMessage === null
    }
  })
}
