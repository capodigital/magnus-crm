import InboxWorkspace from '@components/crm/InboxWorkspace'

import { requireTenantAccess } from '@/lib/app-context'
import { getTenantInbox } from '@/lib/crm/inbox-query'
import { getTenantWhatsappTemplates } from '@/lib/whatsapp/template-service'

const InboxPage = async () => {
  const context = await requireTenantAccess()
  const activeWorkspace = context.tenant ?? context.memberships[0]?.tenant ?? null
  const conversations = activeWorkspace ? await getTenantInbox(activeWorkspace.id) : []
  const templates = activeWorkspace ? await getTenantWhatsappTemplates(activeWorkspace.id) : []

  return <InboxWorkspace workspaceName={activeWorkspace?.name ?? null} conversations={conversations} templates={templates} />
}

export default InboxPage
