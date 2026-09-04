import 'server-only'

import { MessageDirection } from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'
import type { ExtractedWhatsappStatusEvent } from '@/lib/whatsapp/webhook-types'

const statusRank: Record<string, number> = {
  sent: 1,
  delivered: 2,
  read: 3
}

const normalizeStatus = (status: string | null) => status?.trim().toLowerCase() ?? null

export type WhatsappStatusReconciliationResult = {
  matched: boolean
  applied: boolean
  retryable: boolean
  note: string | null
}

export const reconcileWhatsappStatus = async (
  event: ExtractedWhatsappStatusEvent,
  tenantId: string
): Promise<WhatsappStatusReconciliationResult> => {
  if (!event.externalMessageId) {
    return {
      matched: false,
      applied: false,
      retryable: false,
      note: 'Meta status event did not include a message ID.'
    }
  }

  const message = await prisma.message.findFirst({
    where: {
      tenantId,
      direction: MessageDirection.OUTBOUND,
      metaMessageId: event.externalMessageId
    },
    select: {
      id: true,
      externalStatus: true,
      readAt: true
    }
  })

  if (!message) {
    return {
      matched: false,
      applied: false,
      retryable: true,
      note: `No outbound message matched Meta message ID ${event.externalMessageId}.`
    }
  }

  const nextStatus = normalizeStatus(event.externalStatus)

  if (!nextStatus) {
    return {
      matched: true,
      applied: false,
      retryable: false,
      note: 'Meta status event did not include a status value.'
    }
  }

  const currentStatus = normalizeStatus(message.externalStatus)
  const currentRank = currentStatus ? statusRank[currentStatus] ?? 0 : 0
  const nextRank = statusRank[nextStatus] ?? 0

  if (nextStatus !== 'failed' && nextRank === 0) {
    return {
      matched: true,
      applied: false,
      retryable: false,
      note: `Unsupported Meta message status: ${nextStatus}.`
    }
  }

  if (message.readAt || (currentStatus === 'read' && nextStatus !== 'read')) {
    return {
      matched: true,
      applied: false,
      retryable: false,
      note: null
    }
  }

  if (nextStatus !== 'failed' && nextRank <= currentRank) {
    return {
      matched: true,
      applied: false,
      retryable: false,
      note: null
    }
  }

  const eventTime = event.eventTimestamp ?? new Date()

  const updateData = {
    externalStatus: nextStatus,
    ...(nextStatus === 'delivered' || nextStatus === 'read' ? { deliveredAt: eventTime } : {}),
    ...(nextStatus === 'read' ? { readAt: eventTime } : {}),
    ...(nextStatus === 'failed' ? { failedAt: eventTime } : {})
  }

  await prisma.message.update({
    where: {
      id: message.id
    },
    data: updateData
  })

  return {
    matched: true,
    applied: true,
    retryable: false,
    note: event.statusError
  }
}
