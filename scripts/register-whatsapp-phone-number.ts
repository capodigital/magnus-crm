import 'dotenv/config'

import { disconnectPrisma } from '@/lib/prisma'
import { registerWhatsappPhoneNumber } from '@/lib/whatsapp/phone-number-registration'

const requireEnv = (name: string) => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const main = async () => {
  const result = await registerWhatsappPhoneNumber({
    tenantSlug: requireEnv('WHATSAPP_TENANT_SLUG'),
    wabaId: requireEnv('META_WABA_ID'),
    phoneNumberId: requireEnv('META_PHONE_NUMBER_ID'),
    displayPhoneNumber: process.env.WHATSAPP_DISPLAY_PHONE_NUMBER,
    verifiedName: process.env.WHATSAPP_VERIFIED_NAME,
    qualityRating: process.env.WHATSAPP_QUALITY_RATING,
    codeVerificationStatus: process.env.WHATSAPP_CODE_VERIFICATION_STATUS
  })

  console.log('WhatsApp phone number registration completed:')
  console.log(`- tenantSlug: ${result.tenantSlug}`)
  console.log(`- tenantId: ${result.tenantId}`)
  console.log(`- whatsappPhoneNumberId: ${result.whatsappPhoneNumberId}`)
  console.log(`- phoneNumberId: ${result.phoneNumberId}`)
  console.log(`- wabaId: ${result.wabaId}`)
  console.log(`- displayPhoneNumber: ${result.displayPhoneNumber ?? 'n/a'}`)
  console.log(`- created: ${result.created ? 'yes' : 'no'}`)
}

main()
  .catch(error => {
    console.error('WhatsApp phone number registration failed.')
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectPrisma()
  })
