import Stack from '@mui/material/Stack'

import ContactsWorkspace from '@/components/crm/ContactsWorkspace'
import RecordsPagination, { parsePage } from '@/components/crm/RecordsPagination'
import { crmPageAccess as crmAccess } from '@/lib/crm/access'
import { contactList } from '@/lib/crm/records-query'

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; lifecycle?: string }> }) {
  const access = await crmAccess()
  const params = await searchParams
  const page = parsePage(params.page)
  const search = (params.q ?? '').slice(0, 200)
  const lifecycle = ['PROSPECT', 'CUSTOMER', 'INACTIVE'].includes(params.lifecycle ?? '') ? params.lifecycle! : ''
  const data = await contactList(access.tenantId, page, search, lifecycle)


return <Stack spacing={3}><ContactsWorkspace data={data} search={search} lifecycle={lifecycle} canWrite={access.canWrite} /><RecordsPagination page={page} total={data.total} href={`/contacts?q=${encodeURIComponent(search)}&lifecycle=${lifecycle}`} /></Stack>
}
