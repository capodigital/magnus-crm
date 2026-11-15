import { crmAccess, crmRoute } from '@/lib/crm/access'
import { saveActivity } from '@/lib/crm/records-service'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess(true, false)

    return saveActivity(tenantId, await request.json(), (await params).id)
  })
}
