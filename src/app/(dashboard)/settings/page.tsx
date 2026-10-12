import Box from '@mui/material/Box'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import Button from '@components/crm/LinkButton'

import PageHeading from '@components/crm/PageHeading'

import { requireTenantAccess } from '@/lib/app-context'

export default async function SettingsPage() {
  const context = await requireTenantAccess()
  const workspace = context.tenant ?? context.memberships[0]?.tenant
  const membership = context.membership ?? context.memberships[0]

  const roleLabels: Record<string, string> = {
    OWNER: 'Propietario',
    ADMIN: 'Administrador',
    AGENT: 'Agente',
    VIEWER: 'Observador'
  }

  const details = [
    { label: 'Nombre del espacio', value: workspace?.name ?? 'Sin espacio de trabajo' },
    { label: 'Tu acceso', value: roleLabels[membership?.role ?? ''] ?? membership?.role ?? 'Sin asignar' },
    { label: 'Correo de tu cuenta', value: context.session.user.email ?? 'Sin correo' },
    { label: 'Estado', value: workspace?.status === 'ACTIVE' ? 'Activo' : 'Sin espacio activo' }
  ]

  return (
    <Stack spacing={5}>
      <PageHeading
        eyebrow='Configuración'
        title='Tu espacio de trabajo'
        description='Consulta la información de tu empresa y administra las herramientas conectadas a tu CRM.'
      />
      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.3fr) minmax(0, 1fr)' } }}>
        <Card>
          <CardContent sx={{ p: 5 }}>
            <Stack spacing={4}>
              <Stack direction='row' alignItems='center' spacing={2}>
                <i className='tabler-building' aria-hidden='true' />
                <Typography variant='h6'>Información general</Typography>
              </Stack>
              <Divider />
              <Box
                component='dl'
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 5, m: 0 }}
              >
                {details.map(detail => (
                  <Stack key={detail.label} spacing={1}>
                    <Typography component='dt' variant='body2' color='text.secondary'>
                      {detail.label}
                    </Typography>
                    <Typography component='dd' sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                      {detail.value}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 5 }}>
            <Stack spacing={3}>
              <Box sx={{ color: 'primary.main' }}>
                <i className='tabler-plug-connected text-[2rem]' aria-hidden='true' />
              </Box>
              <Typography variant='h6'>Conecta tus herramientas</Typography>
              <Typography variant='body2' color='text.secondary'>
                Gestiona tus canales de comunicación desde Integraciones. Allí puedes conectar WhatsApp y consultar los
                próximos canales disponibles.
              </Typography>
              <Button
                href='/settings/integrations'
                variant='contained'
                endIcon={<i className='tabler-arrow-right' aria-hidden='true' />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Ver integraciones
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  )
}
