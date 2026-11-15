import 'server-only'

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { Prisma } from '../../../prisma/generated/prisma'

import { getCurrentAppContext } from '@/lib/app-context'
import { CrmError } from './contracts'

export async function crmAccess(write = false, marketing = false) {
  if (write) {
    const requestHeaders = await headers()
    const origin = requestHeaders.get('origin')
    const host = requestHeaders.get('host')

    if (origin && origin !== `https://${host}` && origin !== `http://${host}`)
      throw new CrmError('Origen de solicitud no permitido.', 403)
  }

  const context = await getCurrentAppContext()

  if (!context.session?.user) throw new CrmError('Inicia sesión para continuar.', 401)
  const membership = context.requestTenant.isPlatformHost ? context.memberships[0] : context.membership

  if (!membership || membership.tenant.status !== 'ACTIVE') throw new CrmError('No tienes acceso a este espacio.', 403)
  if (write && membership.role === 'VIEWER') throw new CrmError('Tu rol permite consultar, pero no modificar.', 403)
  if (marketing && !['OWNER', 'ADMIN'].includes(membership.role))
    throw new CrmError('Solo administradores pueden gestionar campañas y automatizaciones.', 403)

  return {
    tenantId: membership.tenantId,
    userId: context.session.user.id,
    canWrite: membership.role !== 'VIEWER',
    canMarket: ['OWNER', 'ADMIN'].includes(membership.role)
  }
}

export async function crmRoute(run: () => Promise<unknown>) {
  try {
    return NextResponse.json({ result: await run() })
  } catch (error) {
    if (error instanceof CrmError) return NextResponse.json({ error: error.message }, { status: error.status })
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        return NextResponse.json({ error: 'Ya existe un registro con estos datos.' }, { status: 409 })
      if (error.code === 'P2025') return NextResponse.json({ error: 'Registro no encontrado.' }, { status: 404 })
      if (error.code === 'P2034')
        return NextResponse.json({ error: 'Otro usuario modificó estos datos. Inténtalo de nuevo.' }, { status: 409 })
    }

    console.error('CRM request failed', error instanceof Error ? error.name : 'UnknownError')

    return NextResponse.json({ error: 'No pudimos completar la operación. Inténtalo de nuevo.' }, { status: 500 })
  }
}

export async function crmPageAccess() {
  try { return await crmAccess() } catch (error) {
    if (error instanceof CrmError && error.status === 401) redirect('/login')
    if (error instanceof CrmError && error.status === 403) notFound()
    throw error
  }
}
