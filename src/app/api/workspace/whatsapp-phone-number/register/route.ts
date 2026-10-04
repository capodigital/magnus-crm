import { NextResponse } from 'next/server'

import { TenantRole } from '../../../../../../prisma/generated/prisma/client'

import { getCurrentAppContext } from '@/lib/app-context'
import { registerTenantWhatsappPhone, WhatsappPhoneRegistrationError } from '@/lib/whatsapp/phone-registration-service'

type RegisterPhonePayload = {
  phoneNumberId?: unknown
  pin?: unknown
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

  let payload: RegisterPhonePayload

  try {
    payload = (await request.json()) as RegisterPhonePayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (typeof payload.phoneNumberId !== 'string' || typeof payload.pin !== 'string') {
    return NextResponse.json({ error: 'Phone Number ID y PIN son obligatorios.' }, { status: 400 })
  }

  try {
    const result = await registerTenantWhatsappPhone({
      tenantId: activeMembership.tenantId,
      phoneNumberId: payload.phoneNumberId,
      pin: payload.pin
    })

    return NextResponse.json({ result }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Could not register the WhatsApp phone number.'
    const statusCode = error instanceof WhatsappPhoneRegistrationError ? error.statusCode : 400

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
