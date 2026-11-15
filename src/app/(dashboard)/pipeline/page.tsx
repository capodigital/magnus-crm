import PipelineWorkspace from '@/components/crm/PipelineWorkspace'
import { crmPageAccess as crmAccess } from '@/lib/crm/access'
import { pipelineRecords, salesOptions } from '@/lib/crm/records-query'

export default async function PipelinePage() {
  const { tenantId, canWrite } = await crmAccess()
  const [options, leads] = await Promise.all([salesOptions(tenantId), pipelineRecords(tenantId)])


return <PipelineWorkspace options={options} leads={leads} canWrite={canWrite} />
}
