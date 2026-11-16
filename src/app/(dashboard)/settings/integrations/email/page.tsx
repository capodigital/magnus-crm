import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import PageHeading from '@/components/crm/PageHeading'
import Button from '@/components/crm/LinkButton'
import { crmPageAccess as crmAccess } from '@/lib/crm/access'

export default async function EmailSettingsPage() {
  await crmAccess()

  return (
    <Stack spacing={4}>
      <PageHeading
        eyebrow='Configuración / Integraciones'
        title='Email marketing'
        description='Prepara campañas y mantén el seguimiento de tus contactos con emails automáticos.'
      />
      <Card sx={{ p: 5 }}>
        <Stack spacing={3}>
          <Typography variant='h6'>Campañas y seguimiento</Typography>
          <Typography>
            Selecciona tu audiencia, redacta el mensaje con ayuda de IA y revisa los destinatarios antes de programar
            una campaña. También puedes preparar emails de bienvenida o seguimientos al cambiar la etapa de un negocio.
          </Typography>
          <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap'>
            <Button href='/campaigns' variant='contained'>
              Ver campañas
            </Button>
            <Button href='/automations' variant='outlined'>
              Ver automatizaciones
            </Button>
          </Stack>
          <Typography variant='body2' color='text.secondary'>
            Los envíos requieren consentimiento e incluyen un enlace para cancelar la suscripción. Puedes consultar su
            estado en el historial; el estado Enviado no confirma la entrega ni la lectura del mensaje.
          </Typography>
        </Stack>
      </Card>
    </Stack>
  )
}
