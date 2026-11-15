import 'server-only'

import type { Prisma, Contact } from '../../../prisma/generated/prisma'

import { personalize, type Segment, CrmError } from './contracts'

export const eligibleContacts = (tenantId: string, segment: Segment): Prisma.ContactWhereInput => ({
  tenantId,
  email: { not: null },
  marketingConsent: true,
  unsubscribedAt: null,
  ...(segment.lifecycle ? { lifecycle: segment.lifecycle } : {}),
  ...(segment.tag ? { tags: { has: segment.tag } } : {}),
  ...(segment.source ? { source: segment.source } : {})
})

export function emailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  let validUrl = false

  try {
    validUrl = new URL(baseUrl ?? '').protocol === 'https:'
  } catch {
    /* Missing configuration is displayed in the UI. */
  }

  return {
    ready: Boolean(apiKey && from && validUrl && process.env.CRON_SECRET),
    from: from ?? '',
    baseUrl: baseUrl?.replace(/\/$/, '') ?? ''
  }
}

export function requireEmailConfiguration() {
  const config = emailConfiguration()

  if (!config.ready)
    throw new CrmError(
      'Configura Resend, un remitente verificado, CRON_SECRET y la URL pública HTTPS antes de activar envíos.',
      503
    )

  return config
}

export async function enqueueAutomations(
  tx: Prisma.TransactionClient,
  tenantId: string,
  contact: Contact,
  trigger: string,
  eventKey: string,
  stageId?: string | null
) {
  if (!contact.email || !contact.marketingConsent || contact.unsubscribedAt) return

  const rules = await tx.emailAutomation.findMany({
    where: {
      tenantId,
      active: true,
      trigger,
      ...(trigger === 'LEAD_STAGE_CHANGED' ? { OR: [{ stageId: null }, { stageId }] } : {})
    }
  })

  if (!rules.length) return
  const config = requireEmailConfiguration()

  await tx.emailDelivery.createMany({
    skipDuplicates: true,
    data: rules.map(rule => ({
      tenantId,
      contactId: contact.id,
      automationId: rule.id,
      dedupeKey: `${rule.id}:${eventKey}`,
      toEmail: contact.email!,
      fromEmail: config.from,
      publicBaseUrl: config.baseUrl,
      subject: personalize(rule.subject, contact),
      body: personalize(rule.body, contact),
      dueAt: new Date(Date.now() + rule.delayMinutes * 60000)
    }))
  })
}
