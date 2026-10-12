import Box from '@mui/material/Box'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import Button from '@components/crm/LinkButton'

import PageHeading from './PageHeading'

type Props = { hasConnection: boolean; needsRegistration: boolean; phoneNumber: string | null }

const plannedIntegrations = [
  {
    name: 'Correo electrónico',
    icon: 'tabler-mail',
    description: 'Reúne los correos de tus clientes en el mismo espacio de trabajo.'
  },
  {
    name: 'Calendario',
    icon: 'tabler-calendar',
    description: 'Conecta reuniones y próximos seguimientos con tu actividad comercial.'
  }
]

export default function IntegrationsCatalog({ hasConnection, needsRegistration, phoneNumber }: Props) {
  return (
    <Stack spacing={5}>
      <PageHeading
        eyebrow='Configuración'
        title='Integraciones'
        description='Conecta las herramientas que utiliza tu equipo y reúne la información de tus clientes en Magnus CRM.'
      />
      <Stack direction='row' alignItems='center' spacing={2}>
        <Typography variant='h6'>Canales y herramientas</Typography>
        <Chip size='small' variant='outlined' label='1 disponible' />
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
          gap: 3
        }}
      >
        <Card>
          <CardContent sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'primary.lighterOpacity',
                  color: 'primary.main'
                }}
              >
                <i className='tabler-brand-whatsapp' aria-hidden='true' />
              </Box>
              <Chip
                size='small'
                variant='outlined'
                color={needsRegistration ? 'warning' : hasConnection ? 'success' : 'default'}
                label={needsRegistration ? 'Completar registro' : hasConnection ? 'Vinculada' : 'Sin conectar'}
              />
            </Stack>
            <Stack spacing={1.5} sx={{ flex: 1 }}>
              <Typography variant='h5' component='h2'>
                WhatsApp Business
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Conversa con tus clientes, conecta tu número y gestiona las plantillas de mensajes.
              </Typography>
              {phoneNumber ? (
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {phoneNumber}
                </Typography>
              ) : null}
            </Stack>
            <Button
              href='/settings/integrations/whatsapp'
              variant={hasConnection ? 'outlined' : 'contained'}
              endIcon={<i className='tabler-arrow-right' aria-hidden='true' />}
            >
              {hasConnection ? 'Gestionar integración' : 'Conectar WhatsApp'}
            </Button>
          </CardContent>
        </Card>
        {plannedIntegrations.map(integration => (
          <Card key={integration.name}>
            <CardContent sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
                <Box
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    color: 'text.secondary'
                  }}
                >
                  <i className={integration.icon} aria-hidden='true' />
                </Box>
                <Chip size='small' variant='outlined' label='Próximamente' />
              </Stack>
              <Stack spacing={1.5} sx={{ flex: 1 }}>
                <Typography variant='h5' component='h2'>
                  {integration.name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {integration.description}
                </Typography>
              </Stack>
              <Typography variant='caption' color='text.secondary'>
                Esta integración aún no está disponible.
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Typography variant='body2' color='text.secondary'>
        Aquí encontrarás las nuevas integraciones a medida que estén disponibles. Cada conexión pertenece a tu espacio
        de trabajo.
      </Typography>
    </Stack>
  )
}
