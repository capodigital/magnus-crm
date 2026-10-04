import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { TenantRole } from '../../../../../prisma/generated/prisma/client'

import { getCurrentAppContext } from '@/lib/app-context'
import { type EmbeddedSignupSessionInfo } from '@/lib/whatsapp/embedded-signup-message'
import { connectTenantWhatsappViaEmbeddedSignup } from '@/lib/whatsapp/embedded-signup-service'
import { EMBEDDED_SIGNUP_STATE_COOKIE } from '@/lib/whatsapp/embedded-signup-state'

type EmbeddedSignupPayload = {
  state?: unknown
  code?: unknown
  wabaId?: unknown
  phoneNumberId?: unknown
  businessId?: unknown
  skipPhoneRegistration?: unknown
}

const allowedRoles = new Set<TenantRole>([TenantRole.OWNER, TenantRole.ADMIN])

const asOptionalString = (value: unknown) => (typeof value === 'string' ? value : null)

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

  let payload: EmbeddedSignupPayload

  try {
    payload = (await request.json()) as EmbeddedSignupPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const expectedState = cookieStore.get(EMBEDDED_SIGNUP_STATE_COOKIE)?.value
  const receivedState = asOptionalString(payload.state)

  if (!expectedState || !receivedState || expectedState !== receivedState) {
    return NextResponse.json(
      { error: 'La sesión de onboarding expiró. Inicia la conexión nuevamente.' },
      { status: 403 }
    )
  }

  const code = asOptionalString(payload.code)
  const wabaId = asOptionalString(payload.wabaId)
  const phoneNumberId = asOptionalString(payload.phoneNumberId)

  if (!code || !wabaId) {
    return NextResponse.json(
      { error: 'Meta no devolvió los datos necesarios para conectar el WABA.' },
      { status: 400 }
    )
  }

  const sessionInfo: EmbeddedSignupSessionInfo = {
    wabaId,
    phoneNumberId,
    businessId: asOptionalString(payload.businessId),
    skipPhoneRegistration: payload.skipPhoneRegistration === true
  }

  try {
    const result = await connectTenantWhatsappViaEmbeddedSignup({
      tenantId: activeMembership.tenantId,
      code,
      sessionInfo
    })

    const response = NextResponse.json({ result }, { status: 200 })

    response.cookies.delete(EMBEDDED_SIGNUP_STATE_COOKIE)

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Could not connect the WhatsApp account.'
    const statusCode = error && typeof error === 'object' && 'statusCode' in error ? Number(error.statusCode) : 400

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode >= 400 && statusCode < 600 ? statusCode : 400 }
    )
  }
}
