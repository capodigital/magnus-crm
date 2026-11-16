import 'server-only'

import { choice, objectInput, textInput } from './contracts'
import { generateCrmText } from './ai-client'

export async function generateEmailDraft(input: unknown) {
  const data = objectInput(input)
  const action = choice(data.action, ['campaign_email', 'automation_email'] as const)
  const brief = textInput(data.brief, 'Objetivo del email', 4000)

  const { body } = await generateCrmText(
    action,
    'auto',
    `Redacta el cuerpo de un email ${action === 'campaign_email' ? 'de campaña comercial' : 'de seguimiento automático'}, breve, claro y con una llamada a la acción. Sin asunto ni explicaciones. Puedes usar únicamente {{nombre}} y {{empresa}} para personalizar. No añadas enlaces inventados ni el pie de baja: el sistema lo incorpora.`,
    { brief }
  )

  return { body }
}
