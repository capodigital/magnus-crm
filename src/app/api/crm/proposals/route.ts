import { crmAccess, crmRoute } from '@/lib/crm/access'
import { saveProposal } from '@/lib/crm/records-service'

export async function POST(request: Request) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess(true, false)

    return saveProposal(tenantId, await request.json())
  })
}
