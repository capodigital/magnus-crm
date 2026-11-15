import 'server-only'

import { randomUUID } from 'node:crypto'

import prisma from '@/lib/prisma'
import {
  CrmError,
  objectInput,
  textInput,
  optionalText,
  choice,
  booleanInput,
  integerInput,
  dateInput
} from './contracts'
import { enqueueAutomations } from './email-queue'

export async function saveContact(tenantId: string, input: unknown, id?: string) {
  const data = objectInput(input)
  const email = optionalText(data.email)?.toLowerCase() ?? null
  const phone = optionalText(data.phoneE164, 25)

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CrmError('Correo electrónico inválido.')
  if (phone && !/^\+[1-9]\d{6,14}$/.test(phone))
    throw new CrmError('Usa el teléfono internacional, por ejemplo +5351234567.')
  const consent = booleanInput(data.marketingConsent ?? false)

  const tags = [
    ...new Set(
      textInput(data.tags ?? '', 'Etiquetas', 600, false)
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
    )
  ]

  if (tags.length > 10 || tags.some(tag => tag.length > 60))
    throw new CrmError('Usa hasta 10 etiquetas de 60 caracteres.')

  const values = {
    fullName: textInput(data.fullName, 'Nombre'),
    email,
    phoneE164: phone,
    normalizedPhone: phone,
    company: optionalText(data.company),
    jobTitle: optionalText(data.jobTitle),
    notes: optionalText(data.notes, 10000),
    source: optionalText(data.source, 100) || 'MANUAL',
    lifecycle: choice(data.lifecycle, ['PROSPECT', 'CUSTOMER', 'INACTIVE']),
    tags,
    marketingConsent: consent
  }

  return prisma.$transaction(async tx => {
    const previous = id ? await tx.contact.findFirst({ where: { tenantId, id } }) : null

    if (id && !previous) throw new CrmError('Contacto no encontrado.', 404)
    if (previous?.unsubscribedAt && consent)
      throw new CrmError('Este contacto se dio de baja. No se puede reactivar desde esta ficha.')

    const contact = id
      ? await tx.contact.update({ where: { id, tenantId }, data: { ...values, version: { increment: 1 } } })
      : await tx.contact.create({ data: { ...values, tenantId } })

    if (!id) await enqueueAutomations(tx, tenantId, contact, 'CONTACT_CREATED', contact.id)

    return { id: contact.id }
  })
}

export async function saveLead(tenantId: string, input: unknown, id?: string) {
  const data = objectInput(input)
  const stageId = optionalText(data.stageId)
  const ownerUserId = optionalText(data.ownerUserId)
  const contactId = textInput(data.contactId, 'Contacto')

  return prisma.$transaction(
    async tx => {
      const [contact, previous, stage, owner] = await Promise.all([
        tx.contact.findFirst({ where: { tenantId, id: contactId } }),
        id ? tx.lead.findFirst({ where: { tenantId, id } }) : null,
        stageId ? tx.pipelineStage.findFirst({ where: { tenantId, id: stageId } }) : null,
        ownerUserId
          ? tx.membership.findFirst({ where: { tenantId, userId: ownerUserId, role: { not: 'VIEWER' } } })
          : null
      ])

      if (!contact || (id && !previous) || (stageId && !stage) || (ownerUserId && !owner))
        throw new CrmError('Contacto, etapa o responsable no disponible.', 404)
      if (previous && data.version !== previous.version)
        throw new CrmError('El registro cambió. Actualiza la página antes de guardar.', 409)

      const requestedStatus = choice(data.status, ['OPEN', 'WON', 'LOST', 'ARCHIVED'])
      const changedStage = previous && previous.stageId !== stageId

      const status =
        requestedStatus === 'ARCHIVED'
          ? 'ARCHIVED'
          : stage && (stage.outcome !== 'OPEN' || changedStage)
            ? stage.outcome
            : requestedStatus

      const currency = textInput(data.currency ?? 'USD', 'Moneda', 3).toUpperCase()

      if (!/^[A-Z]{3}$/.test(currency)) throw new CrmError('Usa un código de moneda de tres letras.')

      try {
        new Intl.NumberFormat('es', { style: 'currency', currency })
      } catch {
        throw new CrmError('Moneda inválida.')
      }

      const values = {
        contactId,
        title: textInput(data.title, 'Título'),
        kind: choice(data.kind, ['LEAD', 'OPPORTUNITY']),
        status,
        stageId,
        pipelineId: stage?.pipelineId ?? null,
        ownerUserId,
        valueCents: integerInput(data.valueCents ?? 0, 2000000000),
        currency,
        expectedCloseAt: data.expectedCloseAt ? dateInput(data.expectedCloseAt) : null,
        score: data.score == null || data.score === '' ? null : integerInput(data.score, 100)
      }

      const lead = id
        ? await tx.lead.update({
            where: { id, tenantId, version: previous!.version },
            data: { ...values, version: { increment: 1 } }
          })
        : await tx.lead.create({ data: { ...values, tenantId, sourceChannel: 'MANUAL' } })

      if (status === 'WON')
        await tx.contact.update({ where: { id: contactId, tenantId }, data: { lifecycle: 'CUSTOMER' } })

      if (!previous || previous.stageId !== stageId) {
        await tx.activity.create({
          data: {
            tenantId,
            contactId,
            type: 'NOTE',
            title: `${lead.title} · ${stage?.name ?? 'Sin etapa'}`,
            occursAt: new Date(),
            completedAt: new Date()
          }
        })
        await enqueueAutomations(tx, tenantId, contact, 'LEAD_STAGE_CHANGED', `${lead.id}:${lead.version}`, stageId)
      }

      return { id: lead.id }
    },
    { isolationLevel: 'Serializable' }
  )
}

export async function saveStage(tenantId: string, input: unknown, id?: string) {
  const data = objectInput(input)
  const name = textInput(data.name, 'Nombre', 80)
  const outcome = choice(data.outcome, ['OPEN', 'WON', 'LOST'])
  const color = textInput(data.color ?? '#2563eb', 'Color', 7)

  if (!/^#[a-fA-F0-9]{6}$/.test(color)) throw new CrmError('Color inválido.')

  return prisma.$transaction(
    async tx => {
      if (id)
        return tx.pipelineStage.update({
          where: { tenantId, id },
          data: { name, outcome, isFinal: outcome !== 'OPEN', color }
        })
      const pipelineId = textInput(data.pipelineId, 'Pipeline')

      if (!(await tx.pipeline.findFirst({ where: { tenantId, id: pipelineId } })))
        throw new CrmError('Pipeline no encontrado.', 404)
      const last = await tx.pipelineStage.aggregate({ where: { tenantId, pipelineId }, _max: { position: true } })

      return tx.pipelineStage.create({
        data: {
          tenantId,
          pipelineId,
          name,
          outcome,
          isFinal: outcome !== 'OPEN',
          color,
          slug: randomUUID(),
          position: (last._max.position ?? 0) + 1
        }
      })
    },
    { isolationLevel: 'Serializable' }
  )
}

export async function saveActivity(tenantId: string, input: unknown, id?: string) {
  const data = objectInput(input)

  if (id)
    return prisma.activity.update({
      where: { tenantId, id },
      data: { completedAt: booleanInput(data.completed) ? new Date() : null }
    })
  const contactId = textInput(data.contactId, 'Contacto')

  if (!(await prisma.contact.findFirst({ where: { tenantId, id: contactId }, select: { id: true } })))
    throw new CrmError('Contacto no encontrado.', 404)
  const type = choice(data.type, ['CALL', 'EMAIL', 'MEETING', 'TASK', 'REMINDER', 'NOTE'])

  return prisma.activity.create({
    data: {
      tenantId,
      contactId,
      type,
      title: textInput(data.title, 'Título'),
      description: optionalText(data.description, 10000),
      occursAt: dateInput(data.occursAt),
      completedAt: ['CALL', 'EMAIL', 'NOTE'].includes(type) ? new Date() : null
    }
  })
}

export async function saveProposal(tenantId: string, input: unknown, id?: string) {
  const data = objectInput(input)
  const contactId = textInput(data.contactId, 'Contacto')

  if (!(await prisma.contact.findFirst({ where: { tenantId, id: contactId }, select: { id: true } })))
    throw new CrmError('Contacto no encontrado.', 404)
  const values = { title: textInput(data.title, 'Título'), body: textInput(data.body, 'Propuesta', 20000) }

  return id
    ? prisma.proposal.update({ where: { tenantId, contactId, id }, data: values })
    : prisma.proposal.create({ data: { ...values, tenantId, contactId } })
}
