import { crmAccess, crmRoute } from '@/lib/crm/access'
import { scheduleCampaign } from '@/lib/crm/marketing-service'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess(true, true)

    return scheduleCampaign(tenantId, (await params).id, await request.json())
  })
}
