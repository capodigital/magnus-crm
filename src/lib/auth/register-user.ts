import bcrypt from 'bcryptjs'

import { Role } from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'

export type RegisterUserInput = {
  name: string
  email: string
  password: string
}

const normalizeRequiredValue = (value: string, fieldName: string) => {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

const normalizeEmail = (email: string) => {
  const normalizedEmail = normalizeRequiredValue(email, 'email').toLowerCase()

  if (!normalizedEmail.includes('@')) {
    throw new Error('Provide a valid email address.')
  }

  return normalizedEmail
}

export const registerUser = async (input: RegisterUserInput) => {
  const name = normalizeRequiredValue(input.name, 'name')
  const email = normalizeEmail(input.email)
  const password = normalizeRequiredValue(input.password, 'password')

  if (password.length < 8) {
    throw new Error('Password must contain at least 8 characters.')
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
    throw new Error('An account with that email already exists.')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: Role.USUARIO
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  })

  return user
}
