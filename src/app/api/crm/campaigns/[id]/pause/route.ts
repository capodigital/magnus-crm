import { crmAccess, crmRoute } from '@/lib/crm/access'
import { pauseCampaign } from '@/lib/crm/marketing-service'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess(true, true)

    return pauseCampaign(tenantId, (await params).id)
  })
}
