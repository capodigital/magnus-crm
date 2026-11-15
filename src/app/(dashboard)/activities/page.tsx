import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import ActivitiesWorkspace from '@/components/crm/ActivitiesWorkspace'
import RecordsPagination, { parsePage } from '@/components/crm/RecordsPagination'
import { crmPageAccess as crmAccess } from '@/lib/crm/access'
import { activityList } from '@/lib/crm/records-query'
import { activityLabels } from '@/lib/crm/contracts'

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ page?: string; type?: string; pending?: string }> }) {
  const { tenantId, canWrite } = await crmAccess()
  const params = await searchParams
  const page = parsePage(params.page)
  const pending = params.pending === '1'
  const type = Object.keys(activityLabels).includes(params.type ?? '') ? params.type! : ''
  const data = await activityList(tenantId, page, type, pending)


return <Stack spacing={3}>{!pending ? <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>{[['', 'Todas'], ...Object.entries(activityLabels)].map(([value, label]) => <Button key={value} href={`/activities?type=${value}`} variant={type === value ? 'contained' : 'text'} size='small'>{label}</Button>)}</Stack> : null}<ActivitiesWorkspace items={data.records.map(item => ({ ...item, contactName: item.contact.fullName }))} canWrite={canWrite} pending={pending} /><RecordsPagination total={data.total} page={page} href={`/activities?type=${type}&pending=${pending ? '1' : ''}`} /></Stack>
}
