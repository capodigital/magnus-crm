/* eslint-disable @typescript-eslint/no-empty-object-type */

declare module '@auth/prisma-adapter' {
  export const PrismaAdapter: (...args: any[]) => any
}

declare module '@prisma/adapter-pg' {
  export interface SqlDriverAdapterFactory {
    adapterName: string
    provider: 'postgres'
    connect(): Promise<any>
  }

  export class PrismaPg implements SqlDriverAdapterFactory {
    adapterName: string
    provider: 'postgres'
    constructor(config: { connectionString: string; max?: number })
    connect(): Promise<any>
  }
}

declare module 'bcryptjs' {
  export function compare(plain: string, hash: string): Promise<boolean>
  export function hash(plain: string, saltRounds: number): Promise<string>
}
