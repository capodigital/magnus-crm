import { crmAccess, crmRoute } from '@/lib/crm/access'
import { generateProposal } from '@/lib/crm/proposal-service'

export async function POST(request: Request) {
  return crmRoute(async () => {
    const { tenantId } = await crmAccess(true, false)

    return generateProposal(tenantId, await request.json())
  })
}
