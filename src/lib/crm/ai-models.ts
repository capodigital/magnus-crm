import 'server-only'

import { choice } from './contracts'

export type AiAction = 'proposal' | 'campaign_email' | 'automation_email'
export type AiMode = 'auto' | 'economy' | 'advanced'

export function selectAiModel(action: AiAction, requestedMode: unknown = 'auto') {
  const mode = choice(requestedMode, ['auto', 'economy', 'advanced'] as const)
  const tier = mode === 'advanced' ? 'advanced' : mode === 'economy' || action !== 'proposal' ? 'fast' : 'proposal'

  const configured =
    tier === 'fast'
      ? process.env.OPENAI_MODEL_EMAIL
      : tier === 'advanced'
        ? process.env.OPENAI_MODEL_ADVANCED
        : process.env.OPENAI_MODEL_PROPOSAL

  const defaults = { fast: 'gpt-6-luna', proposal: 'gpt-6.1-sol', advanced: 'gpt-6-astra' }
  const model = configured?.trim() || process.env.OPENAI_MODEL?.trim() || defaults[tier]

  return { model, mode, effort: tier === 'fast' ? ('low' as const) : ('medium' as const) }
}
