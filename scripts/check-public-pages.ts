import assert from 'node:assert/strict'

import { encode } from 'next-auth/jwt'

const base = new URL(process.argv[2] ?? 'http://localhost:3100')
const publicPaths = ['/', '/privacy-policy', '/terms-of-service', '/data-deletion']

async function publicHtml(path: string, cookie?: string) {
  const response = await fetch(new URL(path, base), {
    redirect: 'manual',
    headers: cookie ? { cookie } : undefined,
    signal: AbortSignal.timeout(30000)
  })

  assert.equal(response.status, 200, `${path} must be public without a redirect`)
  assert.match(response.headers.get('content-type') ?? '', /text\/html/)

  const html = await response.text()

  assert.doesNotMatch(html, /NEXT_REDIRECT|http-equiv="refresh"/)
  assert.match(html, /Magnus CRM/)
  assert.match(html, /href="\/privacy-policy"/)
  assert.match(html, /mailto:magnusecosystems@gmail\.com/)

  return html
}

async function main() {
  for (const path of publicPaths) {
    const html = await publicHtml(path)

    if (path === '/') {
      assert.match(html, /<h1[^>]*>Magnus CRM/)
      assert.match(html, /href="\/login"/)
      assert.match(html, /href="\/register"/)
      assert.match(html, /Google identifica tu cuenta/)
    }

    if (path === '/privacy-policy') {
      assert.match(html, /openid, email y profile/)
      assert.match(html, /Conservación y eliminación/)
      assert.match(html, /Resend/)
      assert.match(html, /OpenAI/)
      assert.match(html, /myaccount.google.com\/connections/)
    }

    console.log(`PASS public HTML ${path}`)
  }

  for (const path of ['/home', '/contacts', '/campaigns']) {
    const response = await fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(30000) })

    assert.ok([302, 303, 307, 308].includes(response.status), `${path} must require login`)
    const location = new URL(response.headers.get('location') ?? '', base)

    assert.equal(location.pathname, '/login')
    assert.equal(location.searchParams.get('callbackUrl'), path)
    console.log(`PASS private route ${path}`)
  }

  // Only create synthetic sessions for a local server using an explicit test secret.
  if (['localhost', '127.0.0.1'].includes(base.hostname) && process.env.PUBLIC_SITE_TEST_SECRET) {
    const jwt = await encode({
      secret: process.env.PUBLIC_SITE_TEST_SECRET,
      token: { id: 'public-page-test-only', sub: 'public-page-test-only', role: 'USUARIO' },
      maxAge: 120
    })

    const cookie = `next-auth.session-token=${jwt}`
    const login = await fetch(new URL('/login', base), { redirect: 'manual', headers: { cookie } })

    assert.equal(login.status, 307, 'The local session fixture must be recognized')
    assert.equal(new URL(login.headers.get('location') ?? '', base).pathname, '/home')
    await publicHtml('/', cookie)
    console.log('PASS homepage stays public with a signed-in session')
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Public page check failed')
  process.exitCode = 1
})
