import { redirect } from 'next/navigation'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'

import LeadsTable from '@components/crm/LeadsTable'
import PageHeading from '@components/crm/PageHeading'
import RecordsPagination, { parsePage } from '@components/crm/RecordsPagination'

import { requireTenantAccess } from '@/lib/app-context'
import { getWorkspaceLeads } from '@/lib/crm/workspace-query'

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const context = await requireTenantAccess()
  const workspace = context.tenant ?? context.memberships[0]?.tenant
  const page = parsePage((await searchParams).page)
  const leads = workspace ? await getWorkspaceLeads(workspace.id, page) : { records: [], total: 0 }

  if (page > Math.max(1, Math.ceil(leads.total / 25))) redirect('/leads')

  return (
    <Stack spacing={5}>
      <PageHeading
        eyebrow='CRM'
        title='Oportunidades'
        description='Consulta tus negocios, sus responsables y el avance de cada relación comercial.'
        action={
          <Button
            href='/pipeline'
            variant='outlined'
            startIcon={<i className='tabler-layout-kanban' aria-hidden='true' />}
          >
            Ver pipeline
          </Button>
        }
      />
      <Card>
        <LeadsTable leads={leads.records} />
        <RecordsPagination page={page} total={leads.total} href='/leads' />
      </Card>
    </Stack>
  )
}
