export const lifecycleLabels = { PROSPECT: 'Prospecto', CUSTOMER: 'Cliente', INACTIVE: 'Inactivo' } as const
export const activityLabels = {
  CALL: 'Llamada',
  EMAIL: 'Email',
  MEETING: 'Reunión',
  TASK: 'Tarea',
  REMINDER: 'Recordatorio',
  NOTE: 'Nota'
} as const
export const statusLabels = { OPEN: 'Abierto', WON: 'Ganado', LOST: 'Perdido', ARCHIVED: 'Archivado' } as const
export const triggerLabels = { CONTACT_CREATED: 'Contacto creado', LEAD_STAGE_CHANGED: 'Cambio de etapa' } as const
export type Segment = { lifecycle: string; tag: string; source: string }
export type ClientValue<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? ClientValue<U>[]
    : T extends object
      ? { [K in keyof T]: ClientValue<T[K]> }
      : T
export const toClient = <T>(value: T): ClientValue<T> => JSON.parse(JSON.stringify(value))
export const displayName = (contact: { fullName: string | null; firstName?: string | null; email?: string | null }) =>
  contact.fullName || contact.firstName || contact.email || 'Sin nombre'
export const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat('es', { style: 'currency', currency }).format(cents / 100)

export class CrmError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message)
  }
}

export const objectInput = (input: unknown): Record<string, unknown> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CrmError('Datos inválidos.')

  return input as Record<string, unknown>
}

export const textInput = (input: unknown, label: string, max = 200, required = true): string => {
  if (typeof input !== 'string' || input.trim().length > max || (required && !input.trim()))
    throw new CrmError(`${label}: valor inválido (máximo ${max} caracteres).`)

  return input.trim()
}

export const optionalText = (input: unknown, max = 200) =>
  input == null || input === '' ? null : textInput(input, 'Texto', max)

export const choice = <T extends string>(value: unknown, options: readonly T[]): T => {
  if (typeof value !== 'string' || !options.includes(value as T)) throw new CrmError('Selecciona una opción válida.')

  return value as T
}

export const booleanInput = (input: unknown) => {
  if (typeof input !== 'boolean') throw new CrmError('Valor booleano inválido.')

  return input
}

export const integerInput = (input: unknown, max: number) => {
  if (typeof input !== 'number' || !Number.isSafeInteger(input) || input < 0 || input > max)
    throw new CrmError('Número fuera de rango.')

  return input
}

export const dateInput = (input: unknown): Date => {
  const value = new Date(textInput(input, 'Fecha', 40))

  if (!Number.isFinite(value.getTime())) throw new CrmError('Fecha inválida.')

  return value
}

export const parseSegment = (input: unknown): Segment => {
  const data = objectInput(input)

  return {
    lifecycle: choice(data.lifecycle ?? '', ['', 'PROSPECT', 'CUSTOMER', 'INACTIVE']),
    tag: textInput(data.tag ?? '', 'Etiqueta', 60, false),
    source: textInput(data.source ?? '', 'Origen', 100, false)
  }
}

export const personalize = (template: string, contact: { fullName: string | null; company: string | null }) =>
  template.replace(/\{\{(nombre|empresa)\}\}/g, (_, key) =>
    key === 'nombre' ? contact.fullName || 'cliente' : contact.company || 'tu empresa'
  )
