import 'server-only'

import {
  Prisma
} from '../../../prisma/generated/prisma'
import type { WhatsappTemplateCategory, WhatsappTemplateStatus } from '../../../prisma/generated/prisma'

import prisma from '@/lib/prisma'
import { requestMetaApi, WhatsappMetaApiError } from '@/lib/whatsapp/meta-client'
import { getWhatsappTemplateVariableIndexes } from '@/lib/whatsapp/template-utils'
import {
  whatsappTemplateCategories,
  type WhatsappTemplateCategoryValue,
  type WhatsappTemplateStatusValue,
  type WhatsappTemplateView
} from '@/lib/whatsapp/template-contract'

const MAX_TEMPLATE_BODY_LENGTH = 1024
const TEMPLATE_NAME_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/

type CreateWhatsappTemplateInput = {
  tenantId: string
  name: string
  language: string
  category: WhatsappTemplateCategoryValue
  bodyText: string
  exampleValues: string[]
}

type MetaTemplateComponent = {
  type?: string
  text?: string
}

type MetaTemplateRecord = {
  id?: string
  name?: string
  language?: string
  category?: string
  status?: string
  rejected_reason?: string
  components?: MetaTemplateComponent[]
}

type MetaTemplateListResponse = {
  data?: MetaTemplateRecord[]
}

type MetaTemplateCreateResponse = MetaTemplateRecord

export class WhatsappTemplateError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'WhatsappTemplateError'
    this.statusCode = statusCode
  }
}

const normalizeRequired = (value: string, label: string) => {
  const normalized = value.trim()

  if (!normalized) throw new WhatsappTemplateError(`${label} es obligatorio.`)

  return normalized
}

const normalizeCategory = (value: string): WhatsappTemplateCategoryValue => {
  const category = value.trim().toUpperCase() as WhatsappTemplateCategoryValue

  if (!whatsappTemplateCategories.includes(category) || category === 'AUTHENTICATION') {
    throw new WhatsappTemplateError('Selecciona una categoria valida para la plantilla.')
  }

  return category
}

const normalizeTemplateInput = (input: CreateWhatsappTemplateInput) => {
  const rawName = normalizeRequired(input.name, 'El nombre')

  const name = rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  const language = normalizeRequired(input.language, 'El idioma')
  const bodyText = normalizeRequired(input.bodyText, 'El contenido')

  if (!name || !TEMPLATE_NAME_PATTERN.test(name) || name.length > 512) {
    throw new WhatsappTemplateError('Escribe un nombre válido para identificar la plantilla.')
  }

  if (!/^[a-z]{2,3}_[A-Za-z0-9-]+$/.test(language)) {
    throw new WhatsappTemplateError('Usa un idioma valido, por ejemplo es_ES, es_419 o en_US.')
  }

  if (bodyText.length > MAX_TEMPLATE_BODY_LENGTH) {
    throw new WhatsappTemplateError(`El contenido no puede superar los ${MAX_TEMPLATE_BODY_LENGTH} caracteres.`)
  }

  const variableIndexes = getWhatsappTemplateVariableIndexes(bodyText)

  if (variableIndexes.some((variableIndex, index) => variableIndex !== index + 1)) {
    throw new WhatsappTemplateError('Usa variables consecutivas empezando por {{1}}, por ejemplo {{1}} y {{2}}.')
  }

  if (variableIndexes.length !== input.exampleValues.length) {
    throw new WhatsappTemplateError('Agrega un ejemplo para cada variable para que Meta pueda revisar la plantilla.')
  }

  const exampleValues = input.exampleValues.map((value, index) => {
    const normalized = value.trim()

    if (!normalized) {
      throw new WhatsappTemplateError(`El ejemplo para {{${variableIndexes[index]}}} es obligatorio.`)
    }

    return normalized
  })

  return {
    name,
    language,
    category: normalizeCategory(input.category),
    bodyText,
    exampleValues
  }
}

const mapTemplateCategory = (value?: string): WhatsappTemplateCategoryValue => {
  const category = value?.trim().toUpperCase() as WhatsappTemplateCategoryValue

  return whatsappTemplateCategories.includes(category) ? category : 'UTILITY'
}

const mapTemplateStatus = (value?: string): WhatsappTemplateStatusValue => {
  switch (value?.trim().toUpperCase()) {
    case 'APPROVED':
    case 'ACTIVE':
      return 'APPROVED'
    case 'REJECTED':
      return 'REJECTED'
    case 'PAUSED':
      return 'PAUSED'
    case 'DISABLED':
      return 'DISABLED'
    case 'PENDING':
    case 'IN_REVIEW':
    default:
      return 'PENDING'
  }
}

const getBodyText = (template: MetaTemplateRecord) =>
  template.components?.find(component => component.type?.toUpperCase() === 'BODY')?.text?.trim() ?? null

const getWhatsappWabaId = async (tenantId: string) => {
  const phoneNumber = await prisma.whatsappPhoneNumber.findFirst({
    where: {
      tenantId
    },
    select: {
      wabaId: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (!phoneNumber?.wabaId) {
    throw new WhatsappTemplateError('Vincula primero el WhatsApp Business Account de este workspace.', 409)
  }

  return phoneNumber.wabaId
}

const serializeTemplate = (template: {
  id: string
  name: string
  language: string
  category: WhatsappTemplateCategory
  status: WhatsappTemplateStatus
  bodyText: string
  rejectionReason: string | null
  metaTemplateId: string | null
}): WhatsappTemplateView => ({
  id: template.id,
  name: template.name,
  language: template.language,
  category: template.category,
  status: template.status,
  bodyText: template.bodyText,
  rejectionReason: template.rejectionReason,
  metaTemplateId: template.metaTemplateId
})

const templateSelect = {
  id: true,
  name: true,
  language: true,
  category: true,
  status: true,
  bodyText: true,
  rejectionReason: true,
  metaTemplateId: true
} satisfies Prisma.WhatsappMessageTemplateSelect

const metaErrorToTemplateError = (error: unknown) => {
  if (error instanceof WhatsappMetaApiError) {
    return new WhatsappTemplateError(error.message, error.statusCode)
  }

  return error
}

export const getTenantWhatsappTemplates = async (tenantId: string): Promise<WhatsappTemplateView[]> => {
  const templates = await prisma.whatsappMessageTemplate.findMany({
    where: {
      tenantId
    },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    select: templateSelect
  })

  return templates.map(serializeTemplate)
}

export const createWhatsappTemplate = async (input: CreateWhatsappTemplateInput): Promise<WhatsappTemplateView> => {
  const normalized = normalizeTemplateInput(input)
  const wabaId = await getWhatsappWabaId(input.tenantId)

  const existingTemplate = await prisma.whatsappMessageTemplate.findUnique({
    where: {
      tenantId_name_language: {
        tenantId: input.tenantId,
        name: normalized.name,
        language: normalized.language
      }
    },
    select: {
      id: true
    }
  })

  if (existingTemplate) {
    throw new WhatsappTemplateError('Ya existe una plantilla con ese nombre e idioma en este workspace.', 409)
  }

  let remoteTemplate: MetaTemplateCreateResponse

  try {
    remoteTemplate = await requestMetaApi<MetaTemplateCreateResponse>(`${encodeURIComponent(wabaId)}/message_templates`, {
      method: 'POST',
      body: JSON.stringify({
        name: normalized.name,
        language: normalized.language,
        category: normalized.category,
        components: [
          {
            type: 'BODY',
            text: normalized.bodyText,
            ...(normalized.exampleValues.length
              ? {
                  example: {
                    body_text: [normalized.exampleValues]
                  }
                }
              : {})
          }
        ]
      })
    })
  } catch (error) {
    throw metaErrorToTemplateError(error)
  }

  const metaTemplateId = remoteTemplate.id?.trim()

  if (!metaTemplateId) {
    throw new WhatsappTemplateError('Meta no devolvio un identificador para la plantilla.', 502)
  }

  try {
    const template = await prisma.whatsappMessageTemplate.create({
      data: {
        tenantId: input.tenantId,
        name: normalized.name,
        language: normalized.language,
        category: normalized.category,
        status: mapTemplateStatus(remoteTemplate.status),
        metaTemplateId,
        bodyText: normalized.bodyText,
        rejectionReason: remoteTemplate.rejected_reason ?? null
      },
      select: templateSelect
    })

    return serializeTemplate(template)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new WhatsappTemplateError('Ya existe una plantilla con ese nombre e idioma en este workspace.', 409)
    }

    throw error
  }
}

export const syncWhatsappTemplates = async (tenantId: string): Promise<WhatsappTemplateView[]> => {
  const wabaId = await getWhatsappWabaId(tenantId)
  let remoteTemplates: MetaTemplateRecord[]

  try {
    const response = await requestMetaApi<MetaTemplateListResponse>(`${encodeURIComponent(wabaId)}/message_templates?limit=100`, {
      method: 'GET'
    })

    remoteTemplates = response.data ?? []
  } catch (error) {
    throw metaErrorToTemplateError(error)
  }

  for (const remoteTemplate of remoteTemplates) {
    const name = remoteTemplate.name?.trim()
    const language = remoteTemplate.language?.trim()
    const bodyText = getBodyText(remoteTemplate)

    if (!name || !language || !bodyText) continue

    await prisma.whatsappMessageTemplate.upsert({
      where: {
        tenantId_name_language: {
          tenantId,
          name,
          language
        }
      },
      update: {
        metaTemplateId: remoteTemplate.id?.trim() ?? null,
        category: mapTemplateCategory(remoteTemplate.category),
        status: mapTemplateStatus(remoteTemplate.status),
        bodyText,
        rejectionReason: remoteTemplate.rejected_reason ?? null
      },
      create: {
        tenantId,
        name,
        language,
        category: mapTemplateCategory(remoteTemplate.category),
        status: mapTemplateStatus(remoteTemplate.status),
        metaTemplateId: remoteTemplate.id?.trim() ?? null,
        bodyText,
        rejectionReason: remoteTemplate.rejected_reason ?? null
      }
    })
  }

  return getTenantWhatsappTemplates(tenantId)
}
