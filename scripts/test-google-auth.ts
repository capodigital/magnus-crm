import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

import { compare } from 'bcryptjs'

import prisma, { disconnectPrisma } from '../src/lib/prisma'
import { hasGoogleProvider, verifiedGoogleEmail } from '../src/lib/auth/google'
import { safeCallbackPath, authErrorMessage } from '../src/lib/auth/navigation'
import { completeGoogleRegistration } from '../src/lib/auth/complete-google-registration'
import { registerCompanyWorkspace } from '../src/lib/auth/register-company-workspace'
import { CrmError } from '../src/lib/crm/contracts'

async function main() {
  assert.ok(
    ['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL || 'postgresql://invalid').hostname),
    'Use an isolated local database only.'
  )
  assert.equal(
    verifiedGoogleEmail({ sub: 'google-1', email: 'Owner@Example.test', email_verified: true }),
    'owner@example.test'
  )
  for (const profile of [
    null,
    {},
    { sub: '1', email: 'owner@example.test' },
    { sub: '1', email: 'owner@example.test', email_verified: 'true' },
    { sub: '', email: 'owner@example.test', email_verified: true }
  ])
    assert.equal(verifiedGoogleEmail(profile), null)
  for (const url of [
    'https://evil.test',
    '//evil.test',
    '/a/..//evil.test',
    '/%2e%2e//evil.test',
    '/\\evil.test',
    '/login',
    '/register',
    '/onboarding',
    '/api/auth/signout',
    '/\n/evil.test'
  ])
    assert.equal(safeCallbackPath(url), '/home')
  assert.equal(safeCallbackPath('/contacts/abc?tab=proposals'), '/contacts/abc?tab=proposals')
  assert.match(authErrorMessage('OAuthAccountNotLinked')!, /contraseña/)
  assert.doesNotMatch(authErrorMessage('<script>')!, /script/)

  const savedId = process.env.GOOGLE_CLIENT_ID
  const savedSecret = process.env.GOOGLE_CLIENT_SECRET

  process.env.GOOGLE_CLIENT_ID = 'replace_me'
  process.env.GOOGLE_CLIENT_SECRET = 'replace_me'
  assert.equal(hasGoogleProvider(), false)
  process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com'
  process.env.GOOGLE_CLIENT_SECRET = 'test-only-no-external-requests'
  assert.equal(hasGoogleProvider(), true)
  const { authOptions } = await import('../src/lib/auth')

  const provider = authOptions.providers.find(item => item.id === 'google') as {
    options?: { checks?: string[]; allowDangerousEmailAccountLinking?: boolean }
  }

  assert.ok(provider)
  assert.deepEqual(provider.options?.checks, ['pkce', 'state', 'nonce'])
  assert.equal(provider.options?.allowDangerousEmailAccountLinking, false, 'Do not merge password accounts by email')
  if (savedId === undefined) delete process.env.GOOGLE_CLIENT_ID
  else process.env.GOOGLE_CLIENT_ID = savedId
  if (savedSecret === undefined) delete process.env.GOOGLE_CLIENT_SECRET
  else process.env.GOOGLE_CLIENT_SECRET = savedSecret

  const suffix = randomUUID()
  const users: string[] = []
  const tenants: string[] = []
  const input = { companyName: 'Google QA', acceptedTerms: true }

  try {
    const user = await prisma.user.create({
      data: {
        email: `google-${suffix}@example.test`,
        name: 'Google QA',
        accounts: { create: { provider: 'google', type: 'oauth', providerAccountId: suffix } }
      }
    })

    users.push(user.id)
    await assert.rejects(completeGoogleRegistration(user.id, { ...input, acceptedTerms: false }), CrmError)
    await assert.rejects(completeGoogleRegistration(user.id, { ...input, companyName: ' ' }), CrmError)
    assert.equal(await prisma.membership.count({ where: { userId: user.id } }), 0)

    const results = await Promise.all([
      completeGoogleRegistration(user.id, input),
      completeGoogleRegistration(user.id, input)
    ])

    tenants.push(results[0].tenantId)
    assert.equal(results[0].tenantId, results[1].tenantId, 'Concurrent registration must be idempotent')
    const memberships = await prisma.membership.findMany({ where: { userId: user.id } })

    assert.equal(memberships.length, 1)
    assert.equal(memberships[0].role, 'OWNER')

    const stages = await prisma.pipelineStage.findMany({
      where: { tenantId: results[0].tenantId },
      orderBy: { position: 'asc' }
    })

    assert.deepEqual(
      stages.map(item => item.outcome),
      ['OPEN', 'OPEN', 'OPEN', 'WON', 'LOST']
    )
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).password, null)
    assert.equal(
      (await completeGoogleRegistration(user.id, { ...input, companyName: 'Another company' })).tenantId,
      results[0].tenantId
    )
    await prisma.tenant.update({ where: { id: results[0].tenantId }, data: { status: 'SUSPENDED' } })
    await assert.rejects(
      completeGoogleRegistration(user.id, input),
      (error: unknown) => error instanceof CrmError && error.status === 403
    )

    const local = await registerCompanyWorkspace({
      companyName: 'Password QA',
      ownerName: 'Local QA',
      email: `password-${suffix}@example.test`,
      password: 'Local-Test-Password-2026!'
    })

    users.push(local.user.id)
    tenants.push(local.workspace.tenantId)
    const localUser = await prisma.user.findUniqueOrThrow({ where: { id: local.user.id } })

    assert.ok(await compare('Local-Test-Password-2026!', localUser.password!))
    await assert.rejects(
      completeGoogleRegistration(local.user.id, input),
      (error: unknown) => error instanceof CrmError && error.status === 403
    )
    const existingRole = await prisma.membership.findFirstOrThrow({ where: { userId: local.user.id } })

    await prisma.account.create({
      data: { userId: local.user.id, provider: 'google', type: 'oauth', providerAccountId: `linked-${suffix}` }
    })
    assert.equal((await completeGoogleRegistration(local.user.id, input)).tenantId, local.workspace.tenantId)
    assert.equal(
      (await prisma.membership.findFirstOrThrow({ where: { userId: local.user.id } })).role,
      existingRole.role
    )
    assert.equal(await prisma.membership.count({ where: { userId: local.user.id } }), 1)
    console.log(
      'Google auth: verified identity, redirect safety, OAuth safeguards, transactional onboarding, concurrency, existing memberships and password registration passed. No Google requests made.'
    )
  } finally {
    await prisma.tenant.deleteMany({ where: { id: { in: tenants } } })
    await prisma.user.deleteMany({ where: { id: { in: users } } })
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(disconnectPrisma)
