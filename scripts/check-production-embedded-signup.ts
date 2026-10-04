const baseUrl = (process.env.PRODUCTION_APP_URL ?? 'https://crm.magnusecosystems.com').replace(/\/$/, '')
const endpoint = `${baseUrl}/api/workspace/whatsapp-embedded-signup/state`

const main = async () => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{}',
    signal: AbortSignal.timeout(15_000)
  })

  const contentType = response.headers.get('content-type') ?? ''

  if (response.status !== 401 || !contentType.includes('application/json')) {
    throw new Error(
      `Production Embedded Signup smoke check failed: expected 401 JSON, received ${response.status} ${contentType || 'without content type'}.`
    )
  }

  console.log(`Production Embedded Signup endpoint is deployed and protected: ${endpoint}`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Production smoke check failed.')
  process.exitCode = 1
})
