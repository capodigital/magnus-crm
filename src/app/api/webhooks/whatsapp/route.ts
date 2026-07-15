import { NextResponse } from 'next/server'

import { processWhatsappWebhookPayload } from '@/lib/whatsapp/inbound-service'
import { isValidMetaWebhookSignature } from '@/lib/whatsapp/webhook-signature'
import type { WhatsappWebhookPayload } from '@/lib/whatsapp/webhook-types'

export const runtime = 'nodejs'

const getConfiguredVerifyToken = () => process.env.META_VERIFY_TOKEN?.trim() ?? ''
const getConfiguredAppSecret = () => process.env.META_APP_SECRET?.trim() ?? ''

export async function GET(request: Request) {
  const verifyToken = getConfiguredVerifyToken()

  if (!verifyToken) {
    return NextResponse.json({ error: 'META_VERIFY_TOKEN is not configured.' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }

  return NextResponse.json({ error: 'Webhook verification failed.' }, { status: 403 })
}

export async function POST(request: Request) {
  const appSecret = getConfiguredAppSecret()

  if (!appSecret) {
    return NextResponse.json({ error: 'META_APP_SECRET is not configured.' }, { status: 503 })
  }

  const rawBody = await request.text()
  const signatureHeader = request.headers.get('x-hub-signature-256')

  if (!isValidMetaWebhookSignature(rawBody, signatureHeader, appSecret)) {
    return NextResponse.json({ error: 'Invalid X-Hub-Signature-256 signature.' }, { status: 401 })
  }

  let payload: WhatsappWebhookPayload

  try {
    payload = JSON.parse(rawBody) as WhatsappWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (payload.object !== 'whatsapp_business_account') {
    return NextResponse.json({ received: true, ignored: true }, { status: 200 })
  }

  const result = await processWhatsappWebhookPayload(payload)

  return NextResponse.json({ received: true, result }, { status: 200 })
}
