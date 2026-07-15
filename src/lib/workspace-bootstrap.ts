import bcrypt from 'bcryptjs'

import { DomainKind, Role, TenantBillingMode, TenantMode, TenantRole, TenantStatus } from '../../prisma/generated/prisma/client'

import prisma from '@/lib/prisma'
import { normalizeHost } from '@/lib/tenant'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const defaultPipelineStages = [
  { name: 'Nuevo', slug: 'nuevo', color: '#2563eb', isFinal: false },
  { name: 'Calificado', slug: 'calificado', color: '#d97706', isFinal: false },
  { name: 'Propuesta', slug: 'propuesta', color: '#0891b2', isFinal: false },
  { name: 'Ganado', slug: 'ganado', color: '#16a34a', isFinal: true },
  { name: 'Perdido', slug: 'perdido', color: '#dc2626', isFinal: true }
] as const

type PipelineStageInput = {
  name: string
  slug: string
  color?: string | null
  isFinal?: boolean
}

export type BootstrapWorkspaceInput = {
  tenantSlug: string
  tenantName: string
  ownerEmail: string
  ownerName?: string | null
  ownerPassword?: string | null
  domainHost?: string | null
  pipelineName?: string | null
  pipelineStages?: PipelineStageInput[]
  locale?: string | null
  timezone?: string | null
  supportEmail?: string | null
}

export type BootstrapWorkspaceResult = {
  tenantId: string
  tenantSlug: string
  ownerUserId: string
  primaryDomainHost: string
  pipelineId: string
  stageCount: number
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const normalizeSlug = (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!slugPattern.test(normalizedSlug)) {
    throw new Error('BOOTSTRAP_TENANT_SLUG must use lowercase letters, numbers, and hyphens only.')
  }

  return normalizedSlug
}

const normalizeStageSlug = (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!slugPattern.test(normalizedSlug)) {
    throw new Error(`Invalid pipeline stage slug "${slug}".`)
  }

  return normalizedSlug
}

const buildPrimaryDomainHost = (tenantSlug: string, domainHost?: string | null) => {
  if (domainHost?.trim()) {
    return normalizeHost(domainHost)
  }

  const platformHost = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : 'localhost:3000'

  return `${tenantSlug}.${normalizeHost(platformHost)}`
}

const resolveDomainKind = (domainHost: string) => {
  const platformHost = process.env.NEXT_PUBLIC_APP_URL ? normalizeHost(new URL(process.env.NEXT_PUBLIC_APP_URL).host) : 'localhost'

  return domainHost.endsWith(`.${platformHost}`) ? DomainKind.PLATFORM_SUBDOMAIN : DomainKind.CUSTOM_DOMAIN
}

export const bootstrapWorkspace = async (input: BootstrapWorkspaceInput): Promise<BootstrapWorkspaceResult> => {
  const tenantSlug = normalizeSlug(input.tenantSlug)
  const tenantName = input.tenantName.trim()
  const ownerEmail = normalizeEmail(input.ownerEmail)
  const ownerName = input.ownerName?.trim() || null
  const primaryDomainHost = buildPrimaryDomainHost(tenantSlug, input.domainHost)
  const domainKind = resolveDomainKind(primaryDomainHost)
  const pipelineName = input.pipelineName?.trim() || 'Pipeline comercial'

  const pipelineStages = (input.pipelineStages?.length ? input.pipelineStages : [...defaultPipelineStages]).map((stage, index) => ({
    name: stage.name.trim(),
    slug: normalizeStageSlug(stage.slug),
    color: stage.color ?? null,
    isFinal: stage.isFinal ?? false,
    position: index + 1
  }))

  if (!tenantName) {
    throw new Error('BOOTSTRAP_TENANT_NAME is required.')
  }

  if (!ownerEmail) {
    throw new Error('BOOTSTRAP_OWNER_EMAIL is required.')
  }

  const ownerPasswordHash = input.ownerPassword?.trim() ? await bcrypt.hash(input.ownerPassword, 12) : null

  return prisma.$transaction(async tx => {
    const ownerUser = await tx.user.upsert({
      where: {
        email: ownerEmail
      },
      update: {
        ...(ownerName ? { name: ownerName } : {}),
        ...(ownerPasswordHash ? { password: ownerPasswordHash } : {})
      },
      create: {
        email: ownerEmail,
        name: ownerName,
        password: ownerPasswordHash,
        role: Role.ADMIN
      }
    })

    const tenant = await tx.tenant.upsert({
      where: {
        slug: tenantSlug
      },
      update: {
        name: tenantName,
        locale: input.locale?.trim() || 'es-419',
        timezone: input.timezone?.trim() || 'UTC'
      },
      create: {
        slug: tenantSlug,
        name: tenantName,
        mode: TenantMode.SAAS,
        billingMode: TenantBillingMode.PLATFORM_PLUS_META,
        status: TenantStatus.ACTIVE,
        locale: input.locale?.trim() || 'es-419',
        timezone: input.timezone?.trim() || 'UTC'
      }
    })

    await tx.tenantBranding.upsert({
      where: {
        tenantId: tenant.id
      },
      update: {
        appName: tenantName,
        supportEmail: input.supportEmail?.trim() || ownerEmail,
        emailDomain: primaryDomainHost
      },
      create: {
        tenantId: tenant.id,
        appName: tenantName,
        supportEmail: input.supportEmail?.trim() || ownerEmail,
        emailDomain: primaryDomainHost
      }
    })

    await tx.tenantDomain.upsert({
      where: {
        host: primaryDomainHost
      },
      update: {
        tenantId: tenant.id,
        kind: domainKind,
        isPrimary: true
      },
      create: {
        tenantId: tenant.id,
        host: primaryDomainHost,
        kind: domainKind,
        isPrimary: true
      }
    })

    await tx.membership.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: ownerUser.id
        }
      },
      update: {
        role: TenantRole.OWNER,
        isOwner: true
      },
      create: {
        tenantId: tenant.id,
        userId: ownerUser.id,
        role: TenantRole.OWNER,
        isOwner: true
      }
    })

    const pipeline =
      (await tx.pipeline.findFirst({
        where: {
          tenantId: tenant.id,
          name: pipelineName
        }
      })) ||
      (await tx.pipeline.create({
        data: {
          tenantId: tenant.id,
          name: pipelineName,
          isDefault: true
        }
      }))

    if (!pipeline.isDefault) {
      await tx.pipeline.update({
        where: {
          id: pipeline.id
        },
        data: {
          isDefault: true
        }
      })
    }

    for (const stage of pipelineStages) {
      await tx.pipelineStage.upsert({
        where: {
          pipelineId_slug: {
            pipelineId: pipeline.id,
            slug: stage.slug
          }
        },
        update: {
          name: stage.name,
          color: stage.color,
          isFinal: stage.isFinal,
          position: stage.position,
          tenantId: tenant.id
        },
        create: {
          tenantId: tenant.id,
          pipelineId: pipeline.id,
          name: stage.name,
          slug: stage.slug,
          color: stage.color,
          isFinal: stage.isFinal,
          position: stage.position
        }
      })
    }

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      ownerUserId: ownerUser.id,
      primaryDomainHost,
      pipelineId: pipeline.id,
      stageCount: pipelineStages.length
    }
  })
}
