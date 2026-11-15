import { notFound } from 'next/navigation'

import ContactWorkspace from '@/components/crm/ContactWorkspace'
import { crmPageAccess as crmAccess } from '@/lib/crm/access'
import { contactDetail } from '@/lib/crm/records-query'

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { tenantId, canWrite } = await crmAccess()
  const contact = await contactDetail(tenantId, (await params).id)

  if (!contact) notFound()

return <ContactWorkspace contact={contact} canWrite={canWrite} aiReady={Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL)} />
}
