declare module 'next-auth' {
  export interface DefaultSession {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  export interface DefaultUser {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }

  export interface Session extends DefaultSession {}

  export interface User extends DefaultUser {}

  export interface NextAuthOptions {
    adapter?: unknown
    session?: {
      strategy?: 'jwt' | 'database'
    }
    pages?: {
      signIn?: string
      error?: string
    }
    providers?: unknown[]
    callbacks?: {
      jwt?: (...args: any[]) => Promise<any> | any
      session?: (...args: any[]) => Promise<any> | any
    }
  }

  export default function NextAuth(options: NextAuthOptions): any
}

declare module 'next-auth/next' {
  export function getServerSession(...args: any[]): Promise<any>
}

declare module 'next-auth/jwt' {
  export interface JWT {
    id: string
    role: string
    phone?: string | null
    name?: string | null
    email?: string | null
    image?: string | null
    sub?: string | null
  }

  export function getToken(...args: any[]): Promise<JWT | null>
}

declare module 'next-auth/react' {
  export function signIn(provider?: string, options?: Record<string, unknown>): Promise<any>
  export function signOut(options?: Record<string, unknown>): Promise<any>
}

declare module 'next-auth/providers/credentials' {
  const CredentialsProvider: (...args: any[]) => any
  export default CredentialsProvider
}

declare module 'next-auth/providers/google' {
  const GoogleProvider: (...args: any[]) => any
  export default GoogleProvider
}

declare module '@auth/prisma-adapter' {
  export const PrismaAdapter: (...args: any[]) => any
}

declare module '@prisma/adapter-pg' {
  export interface SqlDriverAdapterFactory {
    adapterName: string
    provider: 'postgresql'
    connect(): Promise<any>
  }

  export class PrismaPg implements SqlDriverAdapterFactory {
    adapterName: string
    provider: 'postgresql'
    constructor(config: { connectionString: string })
    connect(): Promise<any>
  }
}

declare module 'bcryptjs' {
  export function compare(plain: string, hash: string): Promise<boolean>
  export function hash(plain: string, saltRounds: number): Promise<string>
}
