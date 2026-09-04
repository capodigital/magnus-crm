import { NextResponse } from 'next/server'

import { TenantRole } from '../../../../../../prisma/generated/prisma/client'

import { getCurrentAppContext } from '@/lib/app-context'
import { syncWhatsappTemplates, WhatsappTemplateError } from '@/lib/whatsapp/template-service'

const settingsRoles = new Set<TenantRole>([TenantRole.OWNER, TenantRole.ADMIN])

export async function POST() {
  const context = await getCurrentAppContext()

  if (!context.session?.user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const membership = context.tenant
    ? context.membership
    : context.memberships.find(item => settingsRoles.has(item.role))

  if (!membership || !settingsRoles.has(membership.role)) {
    return NextResponse.json({ error: 'Workspace owner or admin access is required.' }, { status: 403 })
  }

  try {
    const templates = await syncWhatsappTemplates(membership.tenantId)

    return NextResponse.json({ result: { templates } })
  } catch (error) {
    if (error instanceof WhatsappTemplateError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'No pudimos sincronizar las plantillas con Meta.' }, { status: 500 })
  }
}
