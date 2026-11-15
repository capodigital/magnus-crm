import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import PageHeading from '@/components/crm/PageHeading'
import { crmPageAccess as crmAccess } from '@/lib/crm/access'
import { emailConfiguration } from '@/lib/crm/email-queue'

export default async function EmailSettingsPage() {
  const { canMarket } = await crmAccess()
  const config = emailConfiguration()


return (
    <Stack spacing={4}>
      <PageHeading
        eyebrow='Configuración / Integraciones'
        title='Email marketing con Resend'
        description='Envía campañas y seguimientos automáticos desde un remitente verificado.'
      />
      <Alert severity={config.ready ? 'success' : 'warning'}>
        {config.ready
          ? `Configurado · ${config.from}`
          : 'Pendiente de configuración. Los borradores se pueden preparar desde Campañas.'}
      </Alert>
      <Card sx={{ p: 5 }}>
        <Stack spacing={3}>
          <Typography variant='h6'>Configuración del servicio</Typography>
          {canMarket ? (
            <>
              <Typography>
                En el servidor configura RESEND_API_KEY y RESEND_FROM_EMAIL, usando un dominio verificado en Resend.
                NEXT_PUBLIC_APP_URL debe contener la URL pública HTTPS del CRM para los enlaces de baja.
              </Typography>
              <Typography>
                Para procesar la cola automáticamente, configura CRON_SECRET y programa GET /api/cron/email cada minuto
                con Authorization: Bearer y ese secreto. Cada ejecución procesa hasta 20 emails; la frecuencia determina
                el tiempo de espera y la capacidad.
              </Typography>
              <Typography>
                La integración de propuestas IA utiliza OPENAI_API_KEY y OPENAI_MODEL. Las claves se configuran en el
                entorno del servidor y nunca se muestran en el navegador.
              </Typography>
            </>
          ) : (
            <Typography>Contacta al administrador del espacio para configurar esta integración.</Typography>
          )}
          <Typography variant='body2' color='text.secondary'>
            Los envíos incluyen enlace de baja y requieren consentimiento del contacto. El historial refleja la
            aceptación por Resend; no incluye estadísticas de apertura o clics.
          </Typography>
        </Stack>
      </Card>
    </Stack>
  )
}
