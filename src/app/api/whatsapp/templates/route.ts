import { NextResponse } from 'next/server'

import { TenantRole } from '../../../../../prisma/generated/prisma/client'

import { getCurrentAppContext } from '@/lib/app-context'
import {
  createWhatsappTemplate,
  getTenantWhatsappTemplates,
  WhatsappTemplateError
} from '@/lib/whatsapp/template-service'
import { whatsappTemplateCategories, type WhatsappTemplateCategoryValue } from '@/lib/whatsapp/template-contract'

const settingsRoles = new Set<TenantRole>([TenantRole.OWNER, TenantRole.ADMIN])

const getSettingsMembership = async () => {
  const context = await getCurrentAppContext()

  if (!context.session?.user) {
    return { response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) }
  }

  const membership = context.tenant
    ? context.membership
    : context.memberships.find(item => settingsRoles.has(item.role))

  if (!membership || !settingsRoles.has(membership.role)) {
    return { response: NextResponse.json({ error: 'Workspace owner or admin access is required.' }, { status: 403 }) }
  }

  return { membership }
}

export async function GET() {
  const access = await getSettingsMembership()

  if ('response' in access) return access.response

  try {
    const templates = await getTenantWhatsappTemplates(access.membership.tenantId)

    return NextResponse.json({ result: { templates } })
  } catch {
    return NextResponse.json({ error: 'No pudimos cargar las plantillas.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const access = await getSettingsMembership()

  if ('response' in access) return access.response

  let payload: {
    name?: unknown
    language?: unknown
    category?: unknown
    bodyText?: unknown
    exampleValues?: unknown
  }

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (
    typeof payload.name !== 'string' ||
    typeof payload.language !== 'string' ||
    typeof payload.category !== 'string' ||
    typeof payload.bodyText !== 'string' ||
    !whatsappTemplateCategories.includes(payload.category.toUpperCase() as WhatsappTemplateCategoryValue)
  ) {
    return NextResponse.json({ error: 'Completa nombre, idioma, categoria y contenido de la plantilla.' }, { status: 400 })
  }

  if (payload.exampleValues !== undefined && (!Array.isArray(payload.exampleValues) || !payload.exampleValues.every(value => typeof value === 'string'))) {
    return NextResponse.json({ error: 'Los ejemplos de las variables no tienen un formato valido.' }, { status: 400 })
  }

  try {
    const template = await createWhatsappTemplate({
      tenantId: access.membership.tenantId,
      name: payload.name,
      language: payload.language,
      category: payload.category.toUpperCase() as WhatsappTemplateCategoryValue,
      bodyText: payload.bodyText,
      exampleValues: payload.exampleValues as string[] | undefined ?? []
    })

    return NextResponse.json({ result: { template } }, { status: 201 })
  } catch (error) {
    if (error instanceof WhatsappTemplateError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'No pudimos enviar la plantilla a Meta.' }, { status: 500 })
  }
}
