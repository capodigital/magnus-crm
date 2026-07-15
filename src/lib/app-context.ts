import 'server-only'

import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { Prisma } from '../../prisma/generated/prisma/client'
import type { Prisma as PrismaTypes } from '../../prisma/generated/prisma/client'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { resolveTenantContext, type TenantContext } from '@/lib/tenant'

const tenantSummarySelect = {
  id: true,
  slug: true,
  name: true,
  mode: true,
  billingMode: true,
  status: true,
  timezone: true,
  locale: true,
  planCode: true,
  branding: {
    select: {
      appName: true,
      logoUrl: true,
      faviconUrl: true,
      primaryColor: true,
      secondaryColor: true,
      supportEmail: true,
      fromName: true,
      emailDomain: true
    }
  }
} satisfies PrismaTypes.TenantSelect

const membershipSummarySelect = {
  id: true,
  tenantId: true,
  userId: true,
  role: true,
  isOwner: true,
  createdAt: true,
  updatedAt: true,
  tenant: {
    select: {
      id: true,
      slug: true,
      name: true,
      mode: true,
      billingMode: true,
      status: true
    }
  }
} satisfies PrismaTypes.MembershipSelect

type SessionData = Awaited<ReturnType<typeof auth>>

export type ResolvedTenant = PrismaTypes.TenantGetPayload<{
  select: typeof tenantSummarySelect
}>

export type ResolvedMembership = PrismaTypes.MembershipGetPayload<{
  select: typeof membershipSummarySelect
}>

export type AppContext = {
  session: SessionData
  requestTenant: TenantContext
  tenant: ResolvedTenant | null
  membership: ResolvedMembership | null
  memberships: ResolvedMembership[]
}

type AuthenticatedAppContext = AppContext & {
  session: NonNullable<SessionData>
}

type TenantAccessContext = AuthenticatedAppContext & {
  tenant: ResolvedTenant
  membership: ResolvedMembership
}

const isMissingTableError = (error: unknown): error is InstanceType<typeof Prisma.PrismaClientKnownRequestError> => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false
  }

  const knownError = error as Prisma.PrismaClientKnownRequestError

  return knownError.code === 'P2021'
}

const getRequestTenantContext = async () => {
  const requestHeaders = await headers()

  return resolveTenantContext(requestHeaders.get('x-magnus-host') ?? requestHeaders.get('host'))
}

const findTenantForRequest = async (requestTenant: TenantContext) => {
  if (requestTenant.isPlatformHost) return null

  try {
    const tenantByHost = await prisma.tenant.findFirst({
      where: {
        status: 'ACTIVE',
        domains: {
          some: {
            host: requestTenant.normalizedHost
          }
        }
      },
      select: tenantSummarySelect
    })

    if (tenantByHost || !requestTenant.isPlatformSubdomain || !requestTenant.tenantSlug) {
      return tenantByHost
    }

    // Only use slug fallback for platform-managed wildcard subdomains.
    return prisma.tenant.findFirst({
      where: {
        slug: requestTenant.tenantSlug,
        status: 'ACTIVE'
      },
      select: tenantSummarySelect
    })
  } catch (error) {
    if (isMissingTableError(error)) return null

    throw error
  }
}

const findMembershipsForUser = async (userId: string) => {
  try {
    return await prisma.membership.findMany({
      where: {
        userId
      },
      select: membershipSummarySelect,
      orderBy: [{ isOwner: 'desc' }, { createdAt: 'asc' }]
    })
  } catch (error) {
    if (isMissingTableError(error)) return []

    throw error
  }
}

export const getCurrentAppContext = async (): Promise<AppContext> => {
  const [requestTenant, session] = await Promise.all([getRequestTenantContext(), auth()])
  const userId = session?.user?.id

  const [tenant, memberships] = await Promise.all([
    findTenantForRequest(requestTenant),
    userId ? findMembershipsForUser(userId) : Promise.resolve([])
  ])

  return {
    session,
    requestTenant,
    tenant,
    membership: tenant ? memberships.find(item => item.tenantId === tenant.id) ?? null : null,
    memberships
  }
}

export const requireAppSession = async (): Promise<AuthenticatedAppContext> => {
  const context = await getCurrentAppContext()

  if (!context.session?.user) {
    redirect('/login')
  }

  return context as AuthenticatedAppContext
}

export const requireTenantAccess = async (): Promise<AuthenticatedAppContext | TenantAccessContext> => {
  const context = await requireAppSession()

  if (context.requestTenant.isPlatformHost) {
    return context
  }

  if (!context.tenant || !context.membership) {
    notFound()
  }

  return context as TenantAccessContext
}
