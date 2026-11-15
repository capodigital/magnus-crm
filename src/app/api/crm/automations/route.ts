import { crmAccess, crmRoute } from '@/lib/crm/access'
import { saveAutomation } from '@/lib/crm/marketing-service'

export async function POST(request: Request) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess(true, true)

    return saveAutomation(tenantId, await request.json())
  })
}
