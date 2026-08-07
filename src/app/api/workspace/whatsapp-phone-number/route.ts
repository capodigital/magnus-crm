import { NextResponse } from 'next/server'

import { TenantRole } from '../../../../../prisma/generated/prisma/client'

import { getCurrentAppContext } from '@/lib/app-context'
import { registerTenantWhatsappPhoneNumber } from '@/lib/whatsapp/phone-number-registration'

type RegisterWorkspacePhonePayload = {
  wabaId?: string
  phoneNumberId?: string
  displayPhoneNumber?: string
  verifiedName?: string
}

const allowedRoles = new Set<TenantRole>([TenantRole.OWNER, TenantRole.ADMIN])

export async function POST(request: Request) {
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

  let payload: RegisterWorkspacePhonePayload

  try {
    payload = (await request.json()) as RegisterWorkspacePhonePayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  try {
    const result = await registerTenantWhatsappPhoneNumber({
      tenantId: activeMembership.tenantId,
      wabaId: payload.wabaId ?? '',
      phoneNumberId: payload.phoneNumberId ?? '',
      displayPhoneNumber: payload.displayPhoneNumber,
      verifiedName: payload.verifiedName
    })

    return NextResponse.json({ result }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Could not register WhatsApp phone number.'

    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
