import 'server-only'

import bcrypt from 'bcryptjs'

import {
  Prisma,
  Role,
  TenantBillingMode,
  TenantMode,
  TenantRole,
  TenantStatus
} from '../../../prisma/generated/prisma/client'

import prisma from '@/lib/prisma'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const defaultPipelineStages = [
  { name: 'Nuevo', slug: 'nuevo', color: '#0F766E', isFinal: false },
  { name: 'Calificado', slug: 'calificado', color: '#C89B3C', isFinal: false },
  { name: 'Propuesta', slug: 'propuesta', color: '#164E63', isFinal: false },
  { name: 'Ganado', slug: 'ganado', color: '#1F9D84', isFinal: true },
  { name: 'Perdido', slug: 'perdido', color: '#DC2626', isFinal: true }
] as const

export type RegisterCompanyWorkspaceInput = {
  ownerName: string
  email: string
  password: string
  companyName: string
}

export class CompanyWorkspaceRegistrationError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'CompanyWorkspaceRegistrationError'
    this.status = status
  }
}

const normalizeRequiredValue = (value: string, fieldName: string) => {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    throw new CompanyWorkspaceRegistrationError(`${fieldName} es requerido.`)
  }

  return normalizedValue
}

const normalizeEmail = (email: string) => {
  const normalizedEmail = normalizeRequiredValue(email, 'email').toLowerCase()

  if (!normalizedEmail.includes('@')) {
    throw new CompanyWorkspaceRegistrationError('Ingresa un email valido.')
  }

  return normalizedEmail
}

const buildSlugBase = (companyName: string) => {
  const normalizedSlug = companyName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slugPattern.test(normalizedSlug) ? normalizedSlug : 'workspace'
}

const findAvailableTenantSlug = async (slugBase: string) => {
  for (let index = 0; index < 50; index += 1) {
    const candidateSlug = index === 0 ? slugBase : `${slugBase}-${index + 1}`

    const existingTenant = await prisma.tenant.findUnique({
      where: {
        slug: candidateSlug
      },
      select: {
        id: true
      }
    })

    if (!existingTenant) {
      return candidateSlug
    }
  }

  throw new CompanyWorkspaceRegistrationError('No pudimos generar un slug disponible para esa empresa.')
}

const getPlatformAppUrl = () => process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000'

const getPlatformHost = () => new URL(getPlatformAppUrl()).host

const isUniqueConstraintError = (error: unknown): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'

export const registerCompanyWorkspace = async (input: RegisterCompanyWorkspaceInput) => {
  const ownerName = normalizeRequiredValue(input.ownerName, 'nombre')
  const email = normalizeEmail(input.email)
  const password = normalizeRequiredValue(input.password, 'contrasena')
  const companyName = normalizeRequiredValue(input.companyName, 'nombre de empresa')

  if (password.length < 8) {
    throw new CompanyWorkspaceRegistrationError('La contrasena debe tener al menos 8 caracteres.')
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email
    },
    select: {
      id: true
    }
  })

  if (existingUser) {
    throw new CompanyWorkspaceRegistrationError('Ya existe una cuenta con ese email.', 409)
  }

  const tenantSlug = await findAvailableTenantSlug(buildSlugBase(companyName))
  const workspaceUrl = getPlatformAppUrl()
  const platformHost = getPlatformHost()
  const passwordHash = await bcrypt.hash(password, 12)

  try {
    return await prisma.$transaction(async tx => {
      const ownerUser = await tx.user.create({
        data: {
          email,
          name: ownerName,
          password: passwordHash,
          role: Role.ADMIN
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      })

      const tenant = await tx.tenant.create({
        data: {
          slug: tenantSlug,
          name: companyName,
          mode: TenantMode.SAAS,
          billingMode: TenantBillingMode.PLATFORM_PLUS_META,
          status: TenantStatus.ACTIVE,
          locale: 'es-419',
          timezone: 'America/Havana'
        },
        select: {
          id: true,
          slug: true,
          name: true
        }
      })

      await tx.tenantBranding.create({
        data: {
          tenantId: tenant.id,
          appName: companyName,
          supportEmail: email,
          emailDomain: platformHost,
          primaryColor: '#0F766E',
          secondaryColor: '#10212A'
        }
      })

      await tx.membership.create({
        data: {
          tenantId: tenant.id,
          userId: ownerUser.id,
          role: TenantRole.OWNER,
          isOwner: true
        }
      })

      const pipeline = await tx.pipeline.create({
        data: {
          tenantId: tenant.id,
          name: 'Pipeline comercial',
          isDefault: true
        },
        select: {
          id: true
        }
      })

      for (const [index, stage] of defaultPipelineStages.entries()) {
        await tx.pipelineStage.create({
          data: {
            tenantId: tenant.id,
            pipelineId: pipeline.id,
            name: stage.name,
            slug: stage.slug,
            color: stage.color,
            isFinal: stage.isFinal,
            position: index + 1
          }
        })
      }

      return {
        user: ownerUser,
        workspace: {
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          tenantName: tenant.name,
          workspaceUrl
        }
      }
    })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new CompanyWorkspaceRegistrationError(
        'Ya existe una empresa o usuario con datos similares. Intenta iniciar sesion o usa otro email.',
        409
      )
    }

    throw error
  }
}
