export const whatsappTemplateCategories = ['UTILITY', 'MARKETING', 'AUTHENTICATION'] as const
export type WhatsappTemplateCategoryValue = (typeof whatsappTemplateCategories)[number]
export const whatsappTemplateCreationCategories = ['UTILITY', 'MARKETING'] as const

export const whatsappTemplateStarterTemplates = [
  {
    name: 'confirmacion_cita',
    category: 'UTILITY',
    bodyText: 'Hola {{1}}, confirmamos tu cita para el {{2}}. Si necesitas cambiarla, responde a este mensaje.',
    exampleValues: ['Maria', '15 de septiembre a las 10:00']
  },
  {
    name: 'actualizacion_solicitud',
    category: 'UTILITY',
    bodyText: 'Hola {{1}}, tenemos una actualización sobre tu solicitud {{2}}. Nuestro equipo está disponible para ayudarte.',
    exampleValues: ['Maria', 'SOL-1042']
  },
  {
    name: 'confirmacion_pedido',
    category: 'UTILITY',
    bodyText: 'Hola {{1}}, confirmamos tu pedido {{2}}. Te avisaremos cuando haya novedades sobre su estado.',
    exampleValues: ['Maria', 'PED-1042']
  }
] as const

export const whatsappTemplateStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED'] as const
export type WhatsappTemplateStatusValue = (typeof whatsappTemplateStatuses)[number]

export type WhatsappTemplateView = {
  id: string
  name: string
  language: string
  category: WhatsappTemplateCategoryValue
  status: WhatsappTemplateStatusValue
  bodyText: string
  rejectionReason: string | null
  metaTemplateId: string | null
}

export const whatsappTemplateCategoryLabels: Record<WhatsappTemplateCategoryValue, string> = {
  UTILITY: 'Utilidad',
  MARKETING: 'Marketing',
  AUTHENTICATION: 'Autenticacion'
}

export const whatsappTemplateStatusLabels: Record<WhatsappTemplateStatusValue, string> = {
  DRAFT: 'Borrador',
  PENDING: 'En revision',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  PAUSED: 'Pausada',
  DISABLED: 'Desactivada'
}
