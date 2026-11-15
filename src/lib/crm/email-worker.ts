import 'server-only'

import prisma from '@/lib/prisma'
import { requireEmailConfiguration } from './email-queue'

export async function processEmailQueue(onlyTenantId?: string) {
  requireEmailConfiguration()
  const now = new Date()
  const stale = new Date(now.getTime() - 5 * 60000)
  const scope = { ...(onlyTenantId ? { tenantId: onlyTenantId } : {}), tenant: { status: 'ACTIVE' as const } }

  const candidates = await prisma.emailDelivery.findMany({
    where: {
      ...scope,
      dueAt: { lte: now },
      OR: [{ status: 'QUEUED' }, { status: 'PROCESSING', lockedAt: { lt: stale } }],
      AND: [
        { OR: [{ campaignId: null }, { campaign: { status: { in: ['SCHEDULED', 'SENDING'] } } }] },
        { OR: [{ automationId: null }, { automation: { active: true } }] }
      ]
    },
    orderBy: { dueAt: 'asc' },
    take: 20
  })

  let sent = 0
  const startedAt = Date.now()

  for (const candidate of candidates) {
    if (Date.now() - startedAt > 40000) break

    const claimed = await prisma.emailDelivery.updateMany({
      where: { id: candidate.id, tenantId: candidate.tenantId, status: candidate.status, lockedAt: candidate.lockedAt },
      data: {
        status: 'PROCESSING',
        lockedAt: now,
        attempts: { increment: 1 },
        firstAttemptAt: candidate.firstAttemptAt ?? now
      }
    })

    if (!claimed.count) continue
    const where = { id: candidate.id, tenantId: candidate.tenantId }

    const contact = await prisma.contact.findFirst({
      where: { id: candidate.contactId, tenantId: candidate.tenantId },
      select: { email: true, marketingConsent: true, unsubscribedAt: true }
    })

    if (!contact?.marketingConsent || contact.unsubscribedAt || contact.email !== candidate.toEmail) {
      await prisma.emailDelivery.update({
        where,
        data: { status: 'SKIPPED', error: 'Sin consentimiento, baja o email modificado.', lockedAt: null }
      })
      continue
    }

    if (candidate.firstAttemptAt && now.getTime() - candidate.firstAttemptAt.getTime() > 23 * 3600000) {
      await prisma.emailDelivery.update({
        where,
        data: { status: 'FAILED', error: 'Revisar en Resend: venció el plazo seguro de reintento.', lockedAt: null }
      })
      continue
    }

    const unsubscribeUrl = `${candidate.publicBaseUrl}/unsubscribe/${candidate.unsubscribeToken}`
    let response: Response

    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': candidate.id
        },
        body: JSON.stringify({
          from: candidate.fromEmail,
          to: [candidate.toEmail],
          subject: candidate.subject,
          text: `${candidate.body}\n\nCancelar suscripción: ${unsubscribeUrl}`,
          headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
        }),
        signal: AbortSignal.timeout(10000)
      })
    } catch {
      await prisma.emailDelivery.update({
        where,
        data: {
          status: candidate.attempts >= 4 ? 'FAILED' : 'QUEUED',
          dueAt: new Date(Date.now() + 5 * 60000),
          lockedAt: null,
          error: 'Resend no respondió. Se conserva la clave del envío para evitar duplicados.'
        }
      })
      continue
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500

      await prisma.emailDelivery.update({
        where,
        data: {
          status: retryable && candidate.attempts < 4 ? 'QUEUED' : 'FAILED',
          dueAt: new Date(Date.now() + 5 * 60000),
          lockedAt: null,
          error: `Resend respondió con HTTP ${response.status}. Revisa la integración.`
        }
      })
      if (response.status === 429) break
      continue
    }

    const result = (await response.json()) as { id?: string }

    if (!result.id) throw new Error('Resend response missing ID')
    await prisma.emailDelivery.update({
      where,
      data: { status: 'SENT', providerId: result.id, sentAt: new Date(), lockedAt: null, error: null }
    })
    sent++
  }

  const campaignIds = [...new Set(candidates.map(item => item.campaignId).filter((id): id is string => Boolean(id)))]

  for (const id of campaignIds) {
    const remaining = await prisma.emailDelivery.count({
      where: { campaignId: id, status: { in: ['QUEUED', 'PROCESSING'] } }
    })

    await prisma.emailCampaign.updateMany({
      where: { id, ...scope, status: { in: ['SCHEDULED', 'SENDING'] } },
      data: { status: remaining ? 'SENDING' : 'COMPLETED' }
    })
  }

  return { processed: candidates.length, sent }
}

export async function unsubscribe(token: string) {
  const delivery = await prisma.emailDelivery.findUnique({
    where: { unsubscribeToken: token },
    select: { tenantId: true, contactId: true }
  })

  if (!delivery) return false
  await prisma.$transaction([
    prisma.contact.update({
      where: { id: delivery.contactId, tenantId: delivery.tenantId },
      data: { marketingConsent: false, unsubscribedAt: new Date() }
    }),
    prisma.emailDelivery.updateMany({
      where: { tenantId: delivery.tenantId, contactId: delivery.contactId, status: 'QUEUED' },
      data: { status: 'SKIPPED', error: 'El contacto canceló su suscripción.' }
    })
  ])

  return true
}
