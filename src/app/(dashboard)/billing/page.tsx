import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import EmptyState from '@components/crm/EmptyState'
import PageHeading from '@components/crm/PageHeading'

import { requireTenantAccess } from '@/lib/app-context'
import { getWorkspacePlan } from '@/lib/crm/workspace-query'

export default async function BillingPage() {
  const context = await requireTenantAccess()
  const workspace = context.tenant ?? context.memberships[0]?.tenant
  const plan = workspace ? (await getWorkspacePlan(workspace.id))?.planCode : null

  return (
    <Stack spacing={5}>
      <PageHeading
        eyebrow='Administración'
        title='Facturación'
        description='Consulta el plan de tu espacio de trabajo y la información de tu suscripción.'
      />
      <Card>
        <CardContent sx={{ p: 5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems={{ sm: 'center' }}
            justifyContent='space-between'
          >
            <Stack spacing={1}>
              <Typography variant='h6'>{workspace?.name ?? 'Tu espacio de trabajo'}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Plan actual
              </Typography>
              <Chip label={plan ?? 'Sin plan asignado'} variant='outlined' sx={{ alignSelf: 'flex-start' }} />
            </Stack>
            <Button href='/settings' variant='outlined'>
              Ver configuración
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <EmptyState
          icon='tabler-receipt'
          title='Sin facturas disponibles'
          description='La consulta de facturas y consumos todavía no está habilitada. Aquí encontrarás esa información cuando esté disponible.'
        />
      </Card>
    </Stack>
  )
}
