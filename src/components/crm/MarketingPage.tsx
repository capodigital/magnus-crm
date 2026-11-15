import MarketingWorkspace from './MarketingWorkspace'
import { crmPageAccess as crmAccess } from '@/lib/crm/access'
import { marketingData } from '@/lib/crm/marketing-service'
import { salesOptions } from '@/lib/crm/records-query'

export default async function MarketingPage({ mode }: { mode: 'campaigns' | 'automations' }) {
  const { tenantId, canMarket } = await crmAccess()
  const [data, options] = await Promise.all([marketingData(tenantId), salesOptions(tenantId)])


return <MarketingWorkspace data={data} options={options} canMarket={canMarket} mode={mode} />
}
