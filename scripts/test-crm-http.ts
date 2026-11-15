import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

import { hash } from 'bcryptjs'

import prisma from '../src/lib/prisma'

async function main() {
  const base = process.env.CRM_TEST_URL || 'http://localhost:3100'
  const database = new URL(process.env.DATABASE_URL || 'postgresql://invalid')

  assert.ok(
    ['localhost', '127.0.0.1'].includes(new URL(base).hostname) &&
      ['localhost', '127.0.0.1'].includes(database.hostname),
    'HTTP tests only run against a local app and database.'
  )
  const suffix = randomUUID()
  const password = randomUUID()

  const user = await prisma.user.create({
    data: { email: `http-${suffix}@example.test`, password: await hash(password, 10), name: 'HTTP QA' }
  })

  const tenant = await prisma.tenant.create({
    data: {
      slug: `http-test-${suffix}`,
      name: 'HTTP test',
      memberships: { create: { userId: user.id, role: 'VIEWER' } }
    }
  })

  const foreign = await prisma.tenant.create({ data: { slug: `http-foreign-${suffix}`, name: 'Foreign' } })
  const foreignContact = await prisma.contact.create({ data: { tenantId: foreign.id, fullName: 'Foreign', tags: [] } })
  const cookies = new Map<string, string>()

  const request = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers)

    headers.set('Cookie', [...cookies.entries()].map(([key, value]) => `${key}=${value}`).join('; '))
    const response = await fetch(`${base}${path}`, { ...options, headers, redirect: 'manual' })

    for (const cookie of response.headers.getSetCookie()) {
      const [key, ...value] = cookie.split(';')[0].split('=')

      cookies.set(key, value.join('='))
    }

    return response
  }

  try {
    assert.equal((await request('/api/crm/contacts/search')).status, 401)
    assert.equal((await request('/api/cron/email')).status, 401)
    const csrf = await (await request('/api/auth/csrf')).json()

    const login = await request('/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        csrfToken: csrf.csrfToken,
        email: user.email!,
        password,
        callbackUrl: `${base}/home`,
        json: 'true'
      })
    })

    assert.equal(login.status, 200)
    assert.ok([...cookies.keys()].some(key => key.includes('session-token')))
    const payload = { fullName: 'Local contact', lifecycle: 'PROSPECT', marketingConsent: false }

    const mutate = (path: string, body: unknown, method = 'POST', origin = base) =>
      request(path, {
        method,
        headers: { 'Content-Type': 'application/json', Origin: origin },
        body: JSON.stringify(body)
      })

    assert.equal((await mutate('/api/crm/contacts', payload)).status, 403, 'Viewer must not write')
    assert.equal((await request('/api/crm/contacts/search?q=Foreign')).status, 200)
    assert.equal((await (await request('/api/crm/contacts/search?q=Foreign')).json()).result.length, 0)
    await prisma.membership.update({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      data: { role: 'MEMBER' }
    })
    assert.equal((await mutate('/api/crm/campaigns', {})).status, 403, 'Member must not manage campaigns')
    assert.equal(
      (await mutate('/api/crm/contacts', payload, 'POST', 'https://foreign.example.test')).status,
      403,
      'Cross-origin writes must fail'
    )
    assert.equal(
      (await mutate(`/api/crm/contacts/${foreignContact.id}`, payload, 'PATCH')).status,
      404,
      'Foreign records must not be mutable'
    )
    const created = await mutate('/api/crm/contacts', payload)

    assert.equal(created.status, 200)
    const contactId = (await created.json()).result.id

    assert.equal((await prisma.contact.findUniqueOrThrow({ where: { id: contactId } })).tenantId, tenant.id)
    await prisma.membership.update({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      data: { role: 'ADMIN' }
    })
    assert.equal(
      (await mutate('/api/crm/campaigns', { name: 'HTTP draft', subject: 'Hello', body: 'Local test', segment: {} }))
        .status,
      200
    )
    const page = await request('/contacts')

    assert.equal(page.status, 200)
    assert.ok((await page.text()).includes('Local contact'))
    console.log(
      'CRM HTTP: session authentication, cron protection, viewer/member/admin permissions, origin check, tenant isolation, contact persistence and authenticated rendering passed.'
    )
  } finally {
    await prisma.tenant.deleteMany({ where: { id: { in: [tenant.id, foreign.id] }, slug: { startsWith: 'http-' } } })
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
