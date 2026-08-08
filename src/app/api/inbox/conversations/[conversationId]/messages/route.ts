import { NextResponse } from 'next/server'

import { TenantRole } from '../../../../../../../prisma/generated/prisma/client'

import { getCurrentAppContext } from '@/lib/app-context'
import { sendWhatsappTextMessage, WhatsappOutboundError } from '@/lib/whatsapp/outbound-service'

type RouteContext = {
  params: Promise<{
    conversationId: string
  }>
}

type SendMessagePayload = {
  body?: unknown
}

const inboxRoles = new Set<TenantRole>([TenantRole.OWNER, TenantRole.ADMIN, TenantRole.MEMBER, TenantRole.AGENT])

export async function POST(request: Request, context: RouteContext) {
  const appContext = await getCurrentAppContext()

  if (!appContext.session?.user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const activeMembership = appContext.tenant
    ? appContext.membership
    : appContext.memberships.find(membership => inboxRoles.has(membership.role))

  if (!activeMembership || !inboxRoles.has(activeMembership.role)) {
    return NextResponse.json({ error: 'Inbox access is required.' }, { status: 403 })
  }

  const { conversationId } = await context.params
  let payload: SendMessagePayload

  try {
    payload = (await request.json()) as SendMessagePayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (typeof payload.body !== 'string') {
    return NextResponse.json({ error: 'Message body is required.' }, { status: 400 })
  }

  try {
    const result = await sendWhatsappTextMessage({
      tenantId: activeMembership.tenantId,
      conversationId,
      body: payload.body
    })

    return NextResponse.json({ result }, { status: 200 })
  } catch (error) {
    if (error instanceof WhatsappOutboundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'No pudimos enviar el mensaje ahora mismo.' }, { status: 500 })
  }
}
