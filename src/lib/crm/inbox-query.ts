import 'server-only'

import { ChannelType, ConversationStatus } from '../../../prisma/generated/prisma'
import type { Prisma } from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'

const inboxConversationSelect = {
  id: true,
  status: true,
  lastMessageAt: true,
  updatedAt: true,
  contact: {
    select: {
      fullName: true,
      firstName: true,
      phoneE164: true,
      whatsappWaId: true
    }
  },
  lead: {
    select: {
      title: true,
      status: true
    }
  },
  whatsappPhoneNumber: {
    select: {
      displayPhoneNumber: true,
      verifiedName: true
    }
  },
  messages: {
    orderBy: {
      createdAt: 'desc'
    },
    take: 50,
    select: {
      id: true,
      direction: true,
      kind: true,
      bodyText: true,
      mediaMimeType: true,
      externalStatus: true,
      createdAt: true
    }
  },
  _count: {
    select: {
      messages: true
    }
  }
} satisfies Prisma.ConversationSelect

type InboxConversationRecord = Prisma.ConversationGetPayload<{
  select: typeof inboxConversationSelect
}>

export type InboxMessage = {
  id: string
  direction: 'INBOUND' | 'OUTBOUND'
  kind: string
  bodyText: string | null
  mediaMimeType: string | null
  externalStatus: string | null
  createdAt: string
}

export type InboxConversation = {
  id: string
  status: string
  lastMessageAt: string | null
  updatedAt: string
  contact: {
    fullName: string | null
    firstName: string | null
    phoneE164: string | null
    whatsappWaId: string | null
  }
  lead: {
    title: string | null
    status: string
  } | null
  whatsappPhoneNumber: {
    displayPhoneNumber: string | null
    verifiedName: string | null
  } | null
  messageCount: number
  messages: InboxMessage[]
}

const serializeConversation = (conversation: InboxConversationRecord): InboxConversation => ({
  id: conversation.id,
  status: conversation.status,
  lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
  updatedAt: conversation.updatedAt.toISOString(),
  contact: conversation.contact,
  lead: conversation.lead,
  whatsappPhoneNumber: conversation.whatsappPhoneNumber,
  messageCount: conversation._count.messages,
  messages: conversation.messages.reverse().map(message => ({
    id: message.id,
    direction: message.direction,
    kind: message.kind,
    bodyText: message.bodyText,
    mediaMimeType: message.mediaMimeType,
    externalStatus: message.externalStatus,
    createdAt: message.createdAt.toISOString()
  }))
})

export const getTenantInbox = async (tenantId: string): Promise<InboxConversation[]> => {
  const conversations = await prisma.conversation.findMany({
    where: {
      tenantId,
      channel: ChannelType.WHATSAPP,
      status: {
        not: ConversationStatus.SPAM
      }
    },
    orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
    take: 50,
    select: inboxConversationSelect
  })

  return conversations.map(serializeConversation)
}
