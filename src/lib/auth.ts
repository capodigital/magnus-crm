import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { JWT } from 'next-auth/jwt'

import prisma from '@/lib/prisma'

const hasGoogleCredentials = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

type AuthUser = {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: string
  phone?: string | null
}

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials: { email?: string; password?: string } | undefined): Promise<AuthUser | null> {
      const email = credentials?.email?.trim().toLowerCase()
      const password = credentials?.password

      if (!email || !password) return null

      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user?.password) return null

      const passwordMatches = await bcrypt.compare(password, user.password)

      if (!passwordMatches) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    }
  })
]

if (hasGoogleCredentials) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  providers,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AuthUser }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? token.role ?? 'USUARIO'
        token.phone = user.phone ?? token.phone ?? null
        token.name = user.name ?? token.name
        token.email = user.email ?? token.email
        token.image = user.image ?? token.image
      }

      const userId = token.id ?? token.sub

      if (!userId) return token
      token.id = userId

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          image: true,
          name: true,
          phone: true,
          role: true
        }
      })

      if (!dbUser) return token

      token.role = dbUser.role
      token.phone = dbUser.phone
      token.name = dbUser.name ?? token.name
      token.email = dbUser.email ?? token.email
      token.image = dbUser.image ?? token.image

      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (!session.user) return session

      session.user.id = token.id
      session.user.role = token.role
      session.user.phone = token.phone ?? null
      session.user.name = token.name ?? session.user.name
      session.user.email = token.email ?? session.user.email
      session.user.image = token.image ?? session.user.image

      return session
    }
  }
}

export const auth = () => getServerSession(authOptions)
