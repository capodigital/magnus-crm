import InboxWorkspace from '@components/crm/InboxWorkspace'

import { requireTenantAccess } from '@/lib/app-context'
import { getTenantInbox } from '@/lib/crm/inbox-query'

const InboxPage = async () => {
  const context = await requireTenantAccess()
  const activeWorkspace = context.tenant ?? context.memberships[0]?.tenant ?? null
  const conversations = activeWorkspace ? await getTenantInbox(activeWorkspace.id) : []

  return <InboxWorkspace workspaceName={activeWorkspace?.name ?? null} conversations={conversations} />
}

export default InboxPage
