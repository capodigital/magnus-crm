import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../prisma/generated/prisma'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '', max: 1 }) })

;(globalThis as unknown as { prisma: PrismaClient }).prisma = prisma
import { CrmError, parseSegment, personalize } from '../src/lib/crm/contracts'

async function main() {
  const { saveContact, saveLead, saveStage, saveActivity, saveProposal } = await import(
    '../src/lib/crm/records-service'
  )

  const { contactDetail, contactList, salesList } = await import('../src/lib/crm/records-query')

  const { previewSegment, saveCampaign, scheduleCampaign, pauseCampaign, resumeCampaign, saveAutomation } =
    await import('../src/lib/crm/marketing-service')

  const { processEmailQueue, unsubscribe } = await import('../src/lib/crm/email-worker')
  const { generateProposal } = await import('../src/lib/crm/proposal-service')

  const database = new URL(process.env.DATABASE_URL ?? 'postgresql://invalid')

  assert.ok(
    ['127.0.0.1', 'localhost'].includes(database.hostname),
    'CRM integration tests require an isolated local database.'
  )
  process.env.CRON_SECRET = 'test-only-cron-secret'
  process.env.RESEND_API_KEY = 'test-only-never-sent'
  process.env.RESEND_FROM_EMAIL = 'Magnus QA <qa@example.test>'
  process.env.NEXT_PUBLIC_APP_URL = 'https://crm.example.test'
  process.env.OPENAI_API_KEY = 'test-only-never-sent'
  process.env.OPENAI_MODEL = 'test-model'
  const calls: { key: string; body: Record<string, unknown> }[] = []
  let providerStatus = 200
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (url, init) => {
    assert.ok(init?.body)
    if (String(url) === 'https://api.openai.com/v1/responses')
      return Response.json({
        status: 'completed',
        output: [
          { type: 'message', content: [{ type: 'output_text', text: 'Propuesta QA. Inversión: [por confirmar].' }] }
        ]
      })
    assert.equal(String(url), 'https://api.resend.com/emails', 'Unexpected external request blocked')
    const headers = new Headers(init.headers)

    calls.push({ key: headers.get('Idempotency-Key')!, body: JSON.parse(String(init.body)) })

    return Response.json(providerStatus === 200 ? { id: `resend-${calls.length}` } : { error: 'simulated' }, {
      status: providerStatus
    })
  }

  const suffix = randomUUID()
  const a = await prisma.tenant.create({ data: { slug: `crm-test-a-${suffix}`, name: 'CRM integration A' } })
  const b = await prisma.tenant.create({ data: { slug: `crm-test-b-${suffix}`, name: 'CRM integration B' } })

  const input = {
    fullName: 'Ana Torres',
    email: 'ana@example.test',
    phoneE164: '+5351234567',
    lifecycle: 'PROSPECT',
    company: 'Estudio Norte',
    marketingConsent: true,
    tags: 'VIP, Cuba, VIP'
  }

  try {
    assert.equal(
      personalize('Hola {{nombre}} de {{empresa}}', { fullName: 'Ana', company: 'Norte' }),
      'Hola Ana de Norte'
    )
    assert.throws(() => parseSegment({ lifecycle: 'invalid' }), CrmError)
    await assert.rejects(saveContact(a.id, { ...input, email: 'invalid' }), CrmError)
    const contact = await saveContact(a.id, input)

    const denied = await saveContact(a.id, {
      ...input,
      fullName: 'Sin permiso',
      email: 'no@example.test',
      phoneE164: '',
      marketingConsent: false,
      tags: ''
    })

    const other = await saveContact(b.id, input)

    assert.deepEqual((await prisma.contact.findUniqueOrThrow({ where: { id: contact.id } })).tags, ['VIP', 'Cuba'])
    assert.equal((await prisma.contact.findUniqueOrThrow({ where: { id: contact.id } })).normalizedPhone, '+5351234567')
    assert.equal(await contactDetail(b.id, contact.id), null)
    assert.equal((await contactList(a.id, 1, 'Norte')).total, 2)
    await assert.rejects(saveContact(b.id, input, contact.id), CrmError)
    assert.equal((await previewSegment(a.id, { lifecycle: '', tag: 'VIP', source: '' })).count, 1)
    assert.equal((await previewSegment(a.id, { lifecycle: 'CUSTOMER', tag: '', source: '' })).count, 0)

    const pipeline = await prisma.pipeline.create({ data: { tenantId: a.id, name: 'Ventas' } })
    const stage = await saveStage(a.id, { pipelineId: pipeline.id, name: 'Nuevo', outcome: 'OPEN', color: '#2563eb' })
    const won = await saveStage(a.id, { pipelineId: pipeline.id, name: 'Ganado', outcome: 'WON', color: '#16a34a' })

    await assert.rejects(saveStage(b.id, { pipelineId: pipeline.id, name: 'Foreign', outcome: 'OPEN' }), CrmError)

    const leadInput = {
      contactId: contact.id,
      title: 'Web corporativa',
      kind: 'LEAD',
      status: 'OPEN',
      stageId: stage.id,
      valueCents: 150000,
      currency: 'USD',
      score: 80
    }

    const lead = await saveLead(a.id, leadInput)

    await assert.rejects(saveLead(a.id, { ...leadInput, contactId: other.id }), CrmError)
    await assert.rejects(saveLead(b.id, leadInput, lead.id), CrmError)
    await assert.rejects(saveLead(a.id, { ...leadInput, version: 0 }, lead.id), CrmError)
    await saveLead(a.id, { ...leadInput, kind: 'OPPORTUNITY', stageId: won.id, version: 1 }, lead.id)
    assert.equal((await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } })).status, 'WON')
    assert.equal((await prisma.contact.findUniqueOrThrow({ where: { id: contact.id } })).lifecycle, 'CUSTOMER')
    assert.equal((await salesList(a.id, 'OPPORTUNITY', 1)).total, 1)

    const activity = await saveActivity(a.id, {
      contactId: contact.id,
      type: 'TASK',
      title: 'Enviar alcance',
      occursAt: new Date().toISOString()
    })

    await assert.rejects(
      saveActivity(b.id, { contactId: contact.id, type: 'CALL', title: 'Foreign', occursAt: new Date().toISOString() }),
      CrmError
    )
    await assert.rejects(saveActivity(b.id, { completed: true }, activity.id))
    await saveActivity(a.id, { completed: true }, activity.id)
    assert.ok((await prisma.activity.findUniqueOrThrow({ where: { id: activity.id } })).completedAt)
    await saveProposal(a.id, { contactId: contact.id, title: 'Manual', body: 'Alcance de prueba' })
    await assert.rejects(generateProposal(b.id, { contactId: contact.id, brief: 'Propuesta' }), CrmError)
    const proposal = await generateProposal(a.id, { contactId: contact.id, brief: 'Propuesta QA' })

    assert.equal(proposal.aiGenerated, true)

    const campaign = await saveCampaign(a.id, {
      name: 'Campaña QA',
      subject: 'Hola {{nombre}}',
      body: 'Gracias, {{empresa}}',
      segment: { lifecycle: '', tag: '', source: '' }
    })

    await assert.rejects(scheduleCampaign(b.id, campaign.id, {}), CrmError)
    assert.equal((await scheduleCampaign(a.id, campaign.id, {})).recipients, 1)
    await assert.rejects(scheduleCampaign(a.id, campaign.id, {}), CrmError)
    await assert.rejects(
      saveCampaign(a.id, { name: 'Edición tardía', subject: 'No', body: 'No', segment: {} }, campaign.id),
      CrmError
    )
    await pauseCampaign(a.id, campaign.id)
    await processEmailQueue(a.id)
    assert.equal(calls.length, 0)
    await resumeCampaign(a.id, campaign.id)
    await Promise.all([processEmailQueue(a.id), processEmailQueue(a.id)])
    assert.equal(calls.length, 1, 'Concurrent workers must not send twice')
    assert.equal(calls[0].body.subject, 'Hola Ana Torres')
    assert.ok(String(calls[0].body.text).includes('/unsubscribe/'))
    await processEmailQueue(a.id)
    assert.equal(calls.length, 1, 'Completed delivery must not be replayed')

    const rule = await saveAutomation(a.id, {
      name: 'Bienvenida',
      trigger: 'CONTACT_CREATED',
      delayMinutes: 0,
      subject: 'Hola {{nombre}}',
      body: 'Bienvenido',
      active: true
    })

    const newContact = await saveContact(a.id, { ...input, email: 'new@example.test', phoneE164: '', tags: '' })

    const delivery = await prisma.emailDelivery.findFirstOrThrow({
      where: { contactId: newContact.id, automationId: rule.id }
    })

    providerStatus = 500
    await processEmailQueue(a.id)
    assert.equal((await prisma.emailDelivery.findUniqueOrThrow({ where: { id: delivery.id } })).status, 'QUEUED')
    await prisma.emailDelivery.update({ where: { id: delivery.id }, data: { dueAt: new Date() } })
    providerStatus = 200
    await processEmailQueue(a.id)
    assert.equal(calls[1].key, calls[2].key, 'Retries must reuse the provider idempotency key')
    assert.deepEqual(calls[1].body, calls[2].body)
    assert.equal((await prisma.emailDelivery.findUniqueOrThrow({ where: { id: delivery.id } })).status, 'SENT')

    const suppressed = await saveContact(a.id, { ...input, email: 'suppressed@example.test', phoneE164: '', tags: '' })
    const suppressedDelivery = await prisma.emailDelivery.findFirstOrThrow({ where: { contactId: suppressed.id } })

    await unsubscribe(suppressedDelivery.unsubscribeToken)
    await processEmailQueue(a.id)
    assert.equal(calls.length, 3, 'Unsubscribed contact must not be sent to')
    assert.equal(
      (await prisma.emailDelivery.findUniqueOrThrow({ where: { id: suppressedDelivery.id } })).status,
      'SKIPPED'
    )
    await assert.rejects(
      saveContact(a.id, { ...input, email: 'suppressed@example.test', phoneE164: '' }, suppressed.id),
      CrmError
    )
    assert.equal(await unsubscribe('unknown'), false)

    await saveAutomation(a.id, {
      name: 'Etapa',
      trigger: 'LEAD_STAGE_CHANGED',
      stageId: stage.id,
      delayMinutes: 0,
      subject: 'Siguiente paso',
      body: 'Seguimiento',
      active: true
    })
    const after = await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } })

    await saveLead(a.id, { ...leadInput, version: after.version }, lead.id)

    const stageCount = await prisma.emailDelivery.count({
      where: { contactId: contact.id, automationId: { not: null } }
    })

    const afterMove = await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } })

    await saveLead(a.id, { ...leadInput, version: afterMove.version }, lead.id)
    assert.equal(
      await prisma.emailDelivery.count({ where: { contactId: contact.id, automationId: { not: null } } }),
      stageCount,
      'Saving unchanged stage must not trigger another email'
    )
    await prisma.emailDelivery.updateMany({
      where: { tenantId: a.id, status: 'QUEUED' },
      data: {
        status: 'PROCESSING',
        lockedAt: new Date(Date.now() - 10 * 60000),
        firstAttemptAt: new Date(Date.now() - 25 * 3600000)
      }
    })
    await processEmailQueue(a.id)
    assert.equal(calls.length, 3, 'Retries outside the idempotency window must fail closed')
    assert.equal(await prisma.emailDelivery.count({ where: { contactId: denied.id } }), 0)
    assert.equal((await contactDetail(a.id, contact.id))?.proposals.length, 2)
    console.log(
      'CRM integration: validation, tenant isolation, lifecycle, stages, activities, proposals, segments, consent, scheduling, pause/resume, concurrency, retries, unsubscribe and automations passed. Provider requests were mocked.'
    )
  } catch (error) {
    console.error('Failure before cleanup', error)
    throw error
  } finally {
    globalThis.fetch = originalFetch
    await prisma.tenant.deleteMany({ where: { id: { in: [a.id, b.id] }, slug: { startsWith: 'crm-test-' } } })
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
