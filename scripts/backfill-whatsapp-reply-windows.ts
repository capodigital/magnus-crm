import 'dotenv/config'

import { MessageDirection } from '../prisma/generated/prisma'

import prisma, { disconnectPrisma } from '@/lib/prisma'

const main = async () => {
  const conversations = await prisma.conversation.findMany({
    where: {
      lastInboundAt: null,
      messages: {
        some: {
          direction: MessageDirection.INBOUND
        }
      }
    },
    select: {
      id: true,
      messages: {
        where: {
          direction: MessageDirection.INBOUND
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1,
        select: {
          createdAt: true
        }
      }
    }
  })

  let updatedCount = 0

  for (const conversation of conversations) {
    const lastInboundAt = conversation.messages[0]?.createdAt

    if (!lastInboundAt) continue

    const result = await prisma.conversation.updateMany({
      where: {
        id: conversation.id,
        lastInboundAt: null
      },
      data: {
        lastInboundAt
      }
    })

    updatedCount += result.count
  }

  const [conversationCount, inboundConversationCount, templateCount] = await Promise.all([
    prisma.conversation.count(),
    prisma.conversation.count({
      where: {
        lastInboundAt: {
          not: null
        }
      }
    }),
    prisma.whatsappMessageTemplate.count()
  ])

  console.log('WhatsApp reply-window backfill completed:')
  console.log(`- conversations updated: ${updatedCount}`)
  console.log(`- conversations with lastInboundAt: ${inboundConversationCount}/${conversationCount}`)
  console.log(`- templates available: ${templateCount}`)
}

main()
  .catch(error => {
    console.error('WhatsApp reply-window backfill failed.')
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectPrisma()
  })
