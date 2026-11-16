import assert from 'node:assert/strict'

import { selectAiModel } from '../src/lib/crm/ai-models'
import { generateEmailDraft } from '../src/lib/crm/email-draft-service'
import { CrmError } from '../src/lib/crm/contracts'
import { emailDeliveryNotice } from '../src/lib/crm/email-delivery-presentation'

async function main() {
  const saved = { ...process.env }
  const originalFetch = globalThis.fetch

  try {
    for (const name of ['OPENAI_MODEL', 'OPENAI_MODEL_EMAIL', 'OPENAI_MODEL_PROPOSAL', 'OPENAI_MODEL_ADVANCED'])
      delete process.env[name]
    assert.equal(selectAiModel('proposal').model, 'gpt-6.1-sol')
    assert.equal(selectAiModel('campaign_email').model, 'gpt-6-luna')
    assert.equal(selectAiModel('automation_email').model, 'gpt-6-luna')
    assert.equal(selectAiModel('proposal', 'economy').model, 'gpt-6-luna')
    assert.equal(selectAiModel('proposal', 'advanced').model, 'gpt-6-astra')
    assert.throws(() => selectAiModel('proposal', 'arbitrary-model'), CrmError)
    process.env.OPENAI_MODEL = 'existing-model'
    assert.equal(selectAiModel('proposal').model, 'existing-model', 'Preserve an existing installation model')
    process.env.OPENAI_MODEL_EMAIL = 'custom-email-model'
    assert.equal(selectAiModel('campaign_email').model, 'custom-email-model', 'Per-action config takes priority')
    delete process.env.OPENAI_MODEL
    delete process.env.OPENAI_MODEL_EMAIL
    delete process.env.OPENAI_API_KEY
    let calls = 0

    globalThis.fetch = async () => {
      calls++
      throw new Error('No external request expected')
    }

    await assert.rejects(
      generateEmailDraft({ action: 'campaign_email', brief: 'Invita a una demo' }),
      (e: unknown) => e instanceof CrmError && e.status === 503 && !/OpenAI|clave|modelo|configur/i.test(e.message)
    )
    assert.equal(calls, 0)
    process.env.OPENAI_API_KEY = 'local-test-never-sent'
    let responseStatus = 'completed'

    globalThis.fetch = async (url, init) => {
      assert.equal(String(url), 'https://api.openai.com/v1/responses')
      const payload = JSON.parse(String(init?.body))

      assert.equal(payload.model, 'gpt-6-luna')
      assert.equal(payload.store, false)
      assert.equal(payload.reasoning.effort, 'low')
      assert.ok(payload.max_output_tokens <= 3000)
      assert.deepEqual(JSON.parse(payload.input), { brief: 'Invita a una demo' })
      calls++

      return Response.json({
        status: responseStatus,
        output: [
          { type: 'message', content: [{ type: 'output_text', text: 'Hola {{nombre}}, coordinemos una demo.' }] }
        ]
      })
    }

    await assert.rejects(generateEmailDraft({ action: 'unsupported', brief: 'Invita a una demo' }), CrmError)
    assert.equal(calls, 0, 'Reject invalid actions before calling provider')
    const result = await generateEmailDraft({ action: 'campaign_email', brief: 'Invita a una demo' })

    assert.equal(result.body, 'Hola {{nombre}}, coordinemos una demo.')
    assert.deepEqual(Object.keys(result), ['body'], 'Public drafts must not expose model or configuration metadata')
    await generateEmailDraft({
      action: 'campaign_email',
      brief: 'Invita a una demo',
      mode: 'advanced',
      model: 'arbitrary-model'
    })
    responseStatus = 'incomplete'
    await assert.rejects(
      generateEmailDraft({ action: 'automation_email', brief: 'Invita a una demo' }),
      (e: unknown) => e instanceof CrmError && e.status === 502 && !/OpenAI|clave|modelo|configur/i.test(e.message)
    )
    globalThis.fetch = async () => Response.json({ error: 'no access' }, { status: 403 })
    await assert.rejects(
      generateEmailDraft({ action: 'campaign_email', brief: 'Invita a una demo' }),
      (e: unknown) => e instanceof CrmError && e.status === 502 && !/OpenAI|clave|modelo|configur/i.test(e.message)
    )

    globalThis.fetch = async () => {
      throw new Error('timeout')
    }

    await assert.rejects(
      generateEmailDraft({ action: 'campaign_email', brief: 'Invita a una demo' }),
      (e: unknown) => e instanceof CrmError && e.status === 504
    )

    for (const status of ['FAILED', 'QUEUED', 'PROCESSING', 'SKIPPED']) {
      const notice = emailDeliveryNotice({ status, error: 'Resend respondió con HTTP 401. Revisa la integración.' })

      assert.ok(notice)
      assert.doesNotMatch(notice, /Resend|HTTP|clave|integración/i)
    }

    assert.equal(emailDeliveryNotice({ status: 'SENT', error: null }), null)
    console.log(
      'CRM AI: routing, overrides, validation, provider payload, incomplete responses and failure handling passed. All requests mocked.'
    )
  } finally {
    globalThis.fetch = originalFetch
    for (const name of Object.keys(process.env)) if (!(name in saved)) delete process.env[name]
    Object.assign(process.env, saved)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
