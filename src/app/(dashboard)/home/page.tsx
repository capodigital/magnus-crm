import HomeDashboard from '@components/crm/HomeDashboard'

import { requireTenantAccess } from '@/lib/app-context'
import { getWorkspaceSummary } from '@/lib/crm/workspace-query'

export default async function HomePage() {
  const context = await requireTenantAccess()
  const workspace = context.tenant ?? context.memberships[0]?.tenant
  const summary = workspace ? await getWorkspaceSummary(workspace.id) : null

  return <HomeDashboard workspaceName={workspace?.name ?? null} summary={summary} />
}
