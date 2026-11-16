import 'server-only'

import { randomUUID } from 'node:crypto'

import type { Prisma } from '../../../prisma/generated/prisma'

const stages = [
  { name: 'Nuevo', slug: 'nuevo', color: '#0F766E', outcome: 'OPEN' },
  { name: 'Calificado', slug: 'calificado', color: '#C89B3C', outcome: 'OPEN' },
  { name: 'Propuesta', slug: 'propuesta', color: '#164E63', outcome: 'OPEN' },
  { name: 'Ganado', slug: 'ganado', color: '#1F9D84', outcome: 'WON' },
  { name: 'Perdido', slug: 'perdido', color: '#DC2626', outcome: 'LOST' }
] as const

export async function createCompanyWorkspace(
  tx: Prisma.TransactionClient,
  input: { companyName: string; ownerId: string; ownerEmail: string }
) {
  const base =
    input.companyName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'empresa'

  const workspaceUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000'

  const tenant = await tx.tenant.create({
    data: {
      slug: `${base}-${randomUUID().replace(/-/g, '').slice(0, 12)}`,
      name: input.companyName,
      mode: 'SAAS',
      billingMode: 'PLATFORM_PLUS_META',
      status: 'ACTIVE',
      locale: 'es-419',
      timezone: 'America/Havana',
      branding: {
        create: {
          appName: input.companyName,
          supportEmail: input.ownerEmail,
          emailDomain: new URL(workspaceUrl).host,
          primaryColor: '#0F766E',
          secondaryColor: '#10212A'
        }
      },
      memberships: { create: { userId: input.ownerId, role: 'OWNER', isOwner: true } }
    },
    select: { id: true, slug: true, name: true }
  })

  const pipeline = await tx.pipeline.create({
    data: { tenantId: tenant.id, name: 'Pipeline comercial', isDefault: true }
  })

  await tx.pipelineStage.createMany({
    data: stages.map((stage, index) => ({
      ...stage,
      tenantId: tenant.id,
      pipelineId: pipeline.id,
      position: index + 1,
      isFinal: stage.outcome !== 'OPEN'
    }))
  })

  return { tenantId: tenant.id, tenantSlug: tenant.slug, tenantName: tenant.name, workspaceUrl }
}
