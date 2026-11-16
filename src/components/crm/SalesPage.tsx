import Stack from '@mui/material/Stack'

import SalesWorkspace from './SalesWorkspace'
import RecordsPagination, { parsePage } from './RecordsPagination'
import { crmPageAccess as crmAccess } from '@/lib/crm/access'
import { salesList, salesOptions } from '@/lib/crm/records-query'

export type SalesParams = Promise<{ page?: string; q?: string; status?: string; create?: string }>

export default async function SalesPage({ kind, searchParams }: { kind: string; searchParams: SalesParams }) {
  const access = await crmAccess()
  const params = await searchParams
  const page = parsePage(params.page)
  const search = (params.q ?? '').slice(0, 200)
  const status = ['OPEN', 'WON', 'LOST', 'ARCHIVED'].includes(params.status ?? '') ? params.status! : ''

  const [data, options] = await Promise.all([
    salesList(access.tenantId, kind, page, search, status),
    salesOptions(access.tenantId)
  ])

  return (
    <Stack spacing={3}>
      <SalesWorkspace
        key={`${kind}-${params.create ?? ''}`}
        data={data}
        options={options}
        kind={kind}
        search={search}
        status={status}
        canWrite={access.canWrite}
        initialCreate={params.create === '1'}
      />
      <RecordsPagination
        page={page}
        total={data.total}
        href={`/${kind === 'LEAD' ? 'leads' : 'opportunities'}?q=${encodeURIComponent(search)}&status=${status}`}
      />
    </Stack>
  )
}
