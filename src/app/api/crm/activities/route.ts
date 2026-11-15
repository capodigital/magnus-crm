import { crmAccess, crmRoute } from '@/lib/crm/access'
import { saveActivity } from '@/lib/crm/records-service'

export async function POST(request: Request) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess(true, false)

    return saveActivity(tenantId, await request.json())
  })
}
