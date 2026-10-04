import { NextResponse } from 'next/server'

import { TenantRole } from '../../../../../../prisma/generated/prisma/client'

import { getCurrentAppContext } from '@/lib/app-context'
import {
  createEmbeddedSignupState,
  EMBEDDED_SIGNUP_STATE_COOKIE,
  EMBEDDED_SIGNUP_STATE_MAX_AGE
} from '@/lib/whatsapp/embedded-signup-state'

const allowedRoles = new Set<TenantRole>([TenantRole.OWNER, TenantRole.ADMIN])

export async function POST() {
  const context = await getCurrentAppContext()

  if (!context.session?.user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const activeMembership = context.tenant
    ? context.membership
    : context.memberships.find(membership => allowedRoles.has(membership.role))

  if (!activeMembership || !allowedRoles.has(activeMembership.role)) {
    return NextResponse.json({ error: 'Workspace owner or admin access is required.' }, { status: 403 })
  }

  const state = createEmbeddedSignupState()
  const response = NextResponse.json({ state })

  response.cookies.set({
    name: EMBEDDED_SIGNUP_STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EMBEDDED_SIGNUP_STATE_MAX_AGE,
    path: '/'
  })

  return response
}
