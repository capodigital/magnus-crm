import IntegrationsCatalog from '@components/crm/IntegrationsCatalog'

import { requireTenantAccess } from '@/lib/app-context'
import { getWorkspaceWhatsappConnection } from '@/lib/crm/workspace-query'

export default async function IntegrationsPage() {
  const context = await requireTenantAccess()
  const workspace = context.tenant ?? context.memberships[0]?.tenant
  const connection = workspace ? await getWorkspaceWhatsappConnection(workspace.id) : null

  return (
    <IntegrationsCatalog
      hasConnection={Boolean(connection)}
      needsRegistration={
        connection?.connectionSource === 'EMBEDDED_SIGNUP' && connection.registrationStatus !== 'REGISTERED'
      }
      phoneNumber={connection?.displayPhoneNumber ?? null}
    />
  )
}
