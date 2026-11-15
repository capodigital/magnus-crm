import 'server-only'

import prisma from '@/lib/prisma'
import {
  CrmError,
  objectInput,
  textInput,
  choice,
  booleanInput,
  integerInput,
  optionalText,
  dateInput,
  parseSegment,
  toClient,
  personalize
} from './contracts'
import { eligibleContacts, emailConfiguration, requireEmailConfiguration } from './email-queue'

export async function marketingData(tenantId: string) {
  const [campaigns, automations, deliveries, statuses] = await Promise.all([
    prisma.emailCampaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { _count: { select: { deliveries: true } } }
    }),
    prisma.emailAutomation.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.emailDelivery.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        contactId: true,
        toEmail: true,
        subject: true,
        status: true,
        dueAt: true,
        sentAt: true,
        error: true
      }
    }),
    prisma.emailDelivery.groupBy({ by: ['status'], where: { tenantId }, _count: { _all: true } })
  ])

  return toClient({ campaigns, automations, deliveries, statuses, email: emailConfiguration() })
}

export async function previewSegment(tenantId: string, input: unknown) {
  const where = eligibleContacts(tenantId, parseSegment(input))

  const [count, sample] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.contact.findMany({ where, take: 8, orderBy: { fullName: 'asc' }, select: { fullName: true, email: true } })
  ])

  return { count, sample }
}

export async function saveCampaign(tenantId: string, input: unknown, id?: string) {
  const data = objectInput(input)

  const values = {
    name: textInput(data.name, 'Nombre'),
    subject: textInput(data.subject, 'Asunto'),
    body: textInput(data.body, 'Email', 20000),
    segment: parseSegment(data.segment)
  }

  if (id) {
    const result = await prisma.emailCampaign.updateMany({ where: { tenantId, id, status: 'DRAFT' }, data: values })

    if (!result.count) throw new CrmError('Solo puedes editar campañas en borrador.', 409)

    return { id }
  }

  return prisma.emailCampaign.create({ data: { tenantId, ...values } })
}

export async function scheduleCampaign(tenantId: string, id: string, input: unknown) {
  const config = requireEmailConfiguration()
  const data = objectInput(input)
  const scheduledAt = data.scheduledAt ? dateInput(data.scheduledAt) : new Date()

  if (data.scheduledAt && scheduledAt.getTime() < Date.now() - 60000) throw new CrmError('Selecciona una fecha futura.')

  return prisma.$transaction(
    async tx => {
      const campaign = await tx.emailCampaign.findFirst({ where: { tenantId, id, status: 'DRAFT' } })

      if (!campaign) throw new CrmError('La campaña ya está programada o no existe.', 409)

      const contacts = await tx.contact.findMany({
        where: eligibleContacts(tenantId, parseSegment(campaign.segment)),
        take: 5001
      })

      if (!contacts.length) throw new CrmError('El segmento no contiene contactos con email y consentimiento.')
      if (contacts.length > 5000) throw new CrmError('Divide este segmento en campañas de hasta 5000 destinatarios.')
      await tx.emailCampaign.update({
        where: { tenantId, id, status: 'DRAFT' },
        data: { status: 'SCHEDULED', scheduledAt }
      })
      await tx.emailDelivery.createMany({
        skipDuplicates: true,
        data: contacts.map(contact => ({
          tenantId,
          contactId: contact.id,
          campaignId: id,
          dedupeKey: `${id}:${contact.id}`,
          toEmail: contact.email!,
          fromEmail: config.from,
          publicBaseUrl: config.baseUrl,
          subject: personalize(campaign.subject, contact),
          body: personalize(campaign.body, contact),
          dueAt: scheduledAt
        }))
      })

      return { recipients: contacts.length }
    },
    { isolationLevel: 'Serializable', timeout: 20000 }
  )
}

export async function pauseCampaign(tenantId: string, id: string) {
  const result = await prisma.emailCampaign.updateMany({
    where: { tenantId, id, status: { in: ['SCHEDULED', 'SENDING', 'PAUSED'] } },
    data: { status: 'PAUSED' }
  })

  if (!result.count) throw new CrmError('La campaña no se puede pausar.', 409)

  return { id }
}

export async function resumeCampaign(tenantId: string, id: string) {
  requireEmailConfiguration()

  const result = await prisma.emailCampaign.updateMany({
    where: { tenantId, id, status: 'PAUSED' },
    data: { status: 'SCHEDULED' }
  })

  if (!result.count) throw new CrmError('La campaña no está pausada.', 409)

  return { id }
}

export async function saveAutomation(tenantId: string, input: unknown, id?: string) {
  const data = objectInput(input)
  const active = booleanInput(data.active ?? false)

  if (active) requireEmailConfiguration()
  const trigger = choice(data.trigger, ['CONTACT_CREATED', 'LEAD_STAGE_CHANGED'])
  const stageId = trigger === 'LEAD_STAGE_CHANGED' ? optionalText(data.stageId) : null

  if (stageId && !(await prisma.pipelineStage.findFirst({ where: { tenantId, id: stageId } })))
    throw new CrmError('Etapa no encontrada.', 404)

  const values = {
    name: textInput(data.name, 'Nombre'),
    trigger,
    stageId,
    delayMinutes: integerInput(data.delayMinutes, 43200),
    subject: textInput(data.subject, 'Asunto'),
    body: textInput(data.body, 'Email', 20000),
    active
  }

  return id
    ? prisma.emailAutomation.update({ where: { tenantId, id }, data: values })
    : prisma.emailAutomation.create({ data: { tenantId, ...values } })
}

export type MarketingData = Awaited<ReturnType<typeof marketingData>>
