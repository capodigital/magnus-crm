import 'server-only'

import bcrypt from 'bcryptjs'

import { Prisma } from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'
import { createCompanyWorkspace } from './create-company-workspace'

export type RegisterCompanyWorkspaceInput = { ownerName: string; email: string; password: string; companyName: string }

export class CompanyWorkspaceRegistrationError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message)
    this.name = 'CompanyWorkspaceRegistrationError'
  }
}

function required(value: unknown, label: string, max: number) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max)
    throw new CompanyWorkspaceRegistrationError(`Revisa ${label}.`)

  return value.trim()
}

export async function registerCompanyWorkspace(input: RegisterCompanyWorkspaceInput) {
  const ownerName = required(input.ownerName, 'tu nombre', 120)
  const email = required(input.email, 'el email', 254).toLowerCase()
  const password = required(input.password, 'la contraseña', 128)
  const companyName = required(input.companyName, 'el nombre de la empresa', 120)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CompanyWorkspaceRegistrationError('Ingresa un email válido.')
  if (password.length < 8)
    throw new CompanyWorkspaceRegistrationError('La contraseña debe tener al menos 8 caracteres.')
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } }))
    throw new CompanyWorkspaceRegistrationError('Ya existe una cuenta con ese email.', 409)

  const passwordHash = await bcrypt.hash(password, 12)

  try {
    return await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: { email, name: ownerName, password: passwordHash, role: 'ADMIN' },
        select: { id: true, email: true, name: true }
      })

      const workspace = await createCompanyWorkspace(tx, { companyName, ownerId: user.id, ownerEmail: email })

      return { user, workspace }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      throw new CompanyWorkspaceRegistrationError('Ya existe una cuenta con esos datos. Intenta iniciar sesión.', 409)

    throw error
  }
}
