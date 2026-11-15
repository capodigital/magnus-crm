import { crmAccess, crmRoute } from '@/lib/crm/access'
import { saveCampaign } from '@/lib/crm/marketing-service'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess(true, true)

    return saveCampaign(tenantId, await request.json(), (await params).id)
  })
}
