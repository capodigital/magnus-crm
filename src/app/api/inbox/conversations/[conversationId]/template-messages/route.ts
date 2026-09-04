import { NextResponse } from 'next/server'

import { TenantRole } from '../../../../../../../prisma/generated/prisma/client'

import { getCurrentAppContext } from '@/lib/app-context'
import { sendWhatsappTemplateMessage } from '@/lib/whatsapp/template-send-service'
import { WhatsappOutboundError } from '@/lib/whatsapp/outbound-service'

type RouteContext = {
  params: Promise<{
    conversationId: string
  }>
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

  let payload: {
    templateId?: unknown
    variables?: unknown
  }

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (
    typeof payload.templateId !== 'string' ||
    !Array.isArray(payload.variables) ||
    !payload.variables.every(variable => typeof variable === 'string')
  ) {
    return NextResponse.json({ error: 'Selecciona una plantilla y completa sus variables.' }, { status: 400 })
  }

  const { conversationId } = await context.params

  try {
    const result = await sendWhatsappTemplateMessage({
      tenantId: activeMembership.tenantId,
      conversationId,
      templateId: payload.templateId,
      variables: payload.variables
    })

    return NextResponse.json({ result }, { status: 200 })
  } catch (error) {
    if (error instanceof WhatsappOutboundError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'No pudimos enviar la plantilla ahora mismo.' }, { status: 500 })
  }
}
