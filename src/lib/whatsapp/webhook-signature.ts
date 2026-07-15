import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

const signaturePrefix = 'sha256='

export const isValidMetaWebhookSignature = (
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
) => {
  if (!signatureHeader?.startsWith(signaturePrefix)) {
    return false
  }

  const expectedSignature = `${signaturePrefix}${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`
  const expectedBuffer = Buffer.from(expectedSignature)
  const receivedBuffer = Buffer.from(signatureHeader)

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer)
}
