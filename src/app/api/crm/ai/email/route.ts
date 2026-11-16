import { crmAccess, crmRoute } from '@/lib/crm/access'
import { generateEmailDraft } from '@/lib/crm/email-draft-service'

export const maxDuration = 60

export async function POST(request: Request) {
  return crmRoute(async () => {
    await crmAccess(true, true)

    return generateEmailDraft(await request.json())
  })
}
