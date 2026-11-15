import 'server-only'

import type { Prisma } from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'
import { toClient } from './contracts'

export async function contactList(tenantId: string, page: number, search = '', lifecycle = '') {
  const where: Prisma.ContactWhereInput = {
    tenantId,
    ...(lifecycle ? { lifecycle } : {}),
    ...(search
      ? {
          OR: ['fullName', 'email', 'company', 'phoneE164'].map(field => ({
            [field]: { contains: search, mode: 'insensitive' }
          }))
        }
      : {})
  }

  const [records, total, customers, prospects] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * 25,
      take: 25,
      select: { id: true, fullName: true, firstName: true, email: true, phoneE164: true, company: true, lifecycle: true, tags: true, _count: { select: { leads: true, conversations: true } } }
    }),
    prisma.contact.count({ where }),
    prisma.contact.count({ where: { tenantId, lifecycle: 'CUSTOMER' } }),
    prisma.contact.count({ where: { tenantId, lifecycle: 'PROSPECT' } })
  ])

  return toClient({ records, total, customers, prospects })
}

export async function contactDetail(tenantId: string, id: string) {
  const contact = await prisma.contact.findFirst({
    where: { tenantId, id },
    include: {
      leads: {
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
        take: 100,
        include: { stage: { select: { name: true } } }
      },
      conversations: {
        where: { tenantId },
        orderBy: { lastMessageAt: 'desc' },
        take: 20,
        select: {
          id: true,
          status: true,
          channel: true,
          messages: {
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: { id: true, bodyText: true, direction: true, createdAt: true }
          }
        }
      },
      activities: { where: { tenantId }, orderBy: { occursAt: 'desc' }, take: 100 },
      proposals: { where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 30 },
      emailDeliveries: {
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, subject: true, body: true, status: true, sentAt: true, dueAt: true, error: true }
      }
    }
  })

  return toClient(contact)
}

export async function salesOptions(tenantId: string) {
  const [pipelines, owners] = await Promise.all([
    prisma.pipeline.findMany({
      where: { tenantId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: { stages: { where: { tenantId }, orderBy: { position: 'asc' } } }
    }),
    prisma.membership.findMany({
      where: { tenantId, role: { not: 'VIEWER' } },
      select: { userId: true, user: { select: { name: true, email: true } } }
    })
  ])

  return toClient({ pipelines, owners })
}

export async function salesList(tenantId: string, kind: string, page: number, search = '', status = '') {
  const where: Prisma.LeadWhereInput = {
    tenantId,
    kind,
    ...(status ? { status: status as Prisma.EnumLeadStatusFilter } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { contact: { fullName: { contains: search, mode: 'insensitive' } } }
          ]
        }
      : {})
  }

  const [records, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: 25,
      skip: (page - 1) * 25,
      include: {
        contact: { select: { id: true, fullName: true, email: true } },
        stage: { select: { name: true } },
        ownerUser: { select: { name: true } }
      }
    }),
    prisma.lead.count({ where })
  ])

  return toClient({ records, total })
}

export async function activityList(tenantId: string, page: number, type = '', pending = false) {
  const where = {
    tenantId,
    ...(type ? { type } : {}),
    ...(pending ? { completedAt: null, type: { in: ['TASK', 'REMINDER', 'MEETING'] } } : {})
  }

  const [records, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { occursAt: pending ? 'asc' : 'desc' },
      take: 25,
      skip: (page - 1) * 25,
      include: { contact: { select: { fullName: true } } }
    }),
    prisma.activity.count({ where })
  ])

  return toClient({ records, total })
}

export type ContactDetail = NonNullable<Awaited<ReturnType<typeof contactDetail>>>
export type ContactList = Awaited<ReturnType<typeof contactList>>
export type SalesOptions = Awaited<ReturnType<typeof salesOptions>>
export type SalesList = Awaited<ReturnType<typeof salesList>>

export async function pipelineRecords(tenantId: string) {
  return toClient(
    await prisma.lead.findMany({
      where: { tenantId, status: 'OPEN' },
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: {
        contact: { select: { id: true, fullName: true, email: true } },
        stage: { select: { name: true } },
        ownerUser: { select: { name: true } }
      }
    })
  )
}
