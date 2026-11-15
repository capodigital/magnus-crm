import { timingSafeEqual } from 'node:crypto'

import { NextResponse } from 'next/server'

import { processEmailQueue } from '@/lib/crm/email-worker'
import { crmRoute } from '@/lib/crm/access'

export const maxDuration = 60

export async function GET(request: Request) {
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  const actual = request.headers.get('authorization') ?? ''

  if (
    !process.env.CRON_SECRET ||
    actual.length !== expected.length ||
    !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  )
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

return crmRoute(() => processEmailQueue())
}
