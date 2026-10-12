import 'server-only'

import { cache } from 'react'

import prisma from '@/lib/prisma'

const leadSelect = {
  id: true,
  title: true,
  status: true,
  sourceChannel: true,
  updatedAt: true,
  stageId: true,
  pipelineId: true,
  contact: { select: { fullName: true, firstName: true, email: true, phoneE164: true } },
  stage: { select: { name: true } },
  ownerUser: { select: { name: true } }
} as const

export const getWorkspaceSummary = cache(async (tenantId: string) => {
  const [contacts, opportunities, conversations, won, recentLeads, leadStatuses] = await Promise.all([
    prisma.contact.count({ where: { tenantId } }),
    prisma.lead.count({ where: { tenantId, status: 'OPEN' } }),
    prisma.conversation.count({ where: { tenantId, status: { in: ['OPEN', 'PENDING'] } } }),
    prisma.lead.count({ where: { tenantId, status: 'WON' } }),
    prisma.lead.findMany({ where: { tenantId }, select: leadSelect, orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.lead.groupBy({ by: ['status'], where: { tenantId }, _count: { _all: true } })
  ])

  return { contacts, opportunities, conversations, won, recentLeads, leadStatuses }
})

export const getWorkspaceLeads = cache(async (tenantId: string, page: number) => {
  const [records, total] = await Promise.all([
    prisma.lead.findMany({
      where: { tenantId },
      select: leadSelect,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: 25,
      skip: (page - 1) * 25
    }),
    prisma.lead.count({ where: { tenantId } })
  ])

  return { records, total }
})

export const getWorkspaceContacts = cache(async (tenantId: string, page: number) => {
  const [records, total] = await Promise.all([
    prisma.contact.findMany({
      where: { tenantId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: 25,
      skip: (page - 1) * 25,
      select: {
        id: true,
        fullName: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneE164: true,
        tags: true,
        updatedAt: true,
        _count: { select: { leads: true } }
      }
    }),
    prisma.contact.count({ where: { tenantId } })
  ])

  return { records, total }
})

export const getWorkspacePipeline = cache(async (tenantId: string) => {
  const [pipelines, leads] = await Promise.all([
    prisma.pipeline.findMany({
      where: { tenantId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        stages: { where: { tenantId }, orderBy: { position: 'asc' }, select: { id: true, name: true } }
      }
    }),
    prisma.lead.findMany({
      where: { tenantId, status: 'OPEN' },
      select: leadSelect,
      orderBy: { updatedAt: 'desc' },
      take: 200
    })
  ])

  return { pipelines, leads }
})

export type WorkspaceSummary = Awaited<ReturnType<typeof getWorkspaceSummary>>
export type WorkspaceLead = WorkspaceSummary['recentLeads'][number]

export const getWorkspacePlan = cache((tenantId: string) =>
  prisma.tenant.findUnique({ where: { id: tenantId }, select: { planCode: true } })
)

export const getWorkspaceWhatsappConnection = cache((tenantId: string) =>
  prisma.whatsappPhoneNumber.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: {
      wabaId: true,
      phoneNumberId: true,
      displayPhoneNumber: true,
      verifiedName: true,
      connectionSource: true,
      registrationStatus: true
    }
  })
)
