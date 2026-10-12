import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import Button from '@components/crm/LinkButton'

import PageHeading from '@components/crm/PageHeading'
import WhatsappEmbeddedSignupPanel from '@components/crm/WhatsappEmbeddedSignupPanel'
import WhatsappPhoneNumberPanel from '@components/crm/WhatsappPhoneNumberPanel'
import WhatsappTemplatesPanel from '@components/crm/WhatsappTemplatesPanel'

import { requireTenantAccess } from '@/lib/app-context'
import { getWorkspaceWhatsappConnection } from '@/lib/crm/workspace-query'
import { getTenantWhatsappTemplates } from '@/lib/whatsapp/template-service'
import { hasValidMetaEncryptionKey } from '@/lib/whatsapp/token-vault'

export default async function WhatsappIntegrationPage() {
  const context = await requireTenantAccess()
  const workspace = context.tenant ?? context.memberships[0]?.tenant ?? null

  const [phoneNumber, templates] = await Promise.all([
    workspace ? getWorkspaceWhatsappConnection(workspace.id) : null,
    workspace ? getTenantWhatsappTemplates(workspace.id) : []
  ])

  const configured = Boolean(
    process.env.META_APP_ID?.trim() &&
      process.env.NEXT_PUBLIC_META_APP_ID?.trim() &&
      process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() &&
      process.env.META_APP_SECRET?.trim() &&
      hasValidMetaEncryptionKey()
  )

  const step = !phoneNumber
    ? 0
    : phoneNumber.connectionSource === 'EMBEDDED_SIGNUP' && phoneNumber.registrationStatus !== 'REGISTERED'
      ? 1
      : 2

  return (
    <Stack spacing={5}>
      <Button
        href='/settings/integrations'
        startIcon={<i className='tabler-arrow-left' aria-hidden='true' />}
        sx={{ alignSelf: 'flex-start' }}
      >
        Todas las integraciones
      </Button>
      <PageHeading
        eyebrow='Configuración / Integraciones'
        title='WhatsApp Business'
        description='Conecta tu cuenta, habilita el número de tu equipo y prepara tus plantillas de mensajes.'
        action={
          <Button href='/inbox' variant='outlined'>
            Abrir conversaciones
          </Button>
        }
      />
      <Box
        component='ol'
        aria-label='Pasos de conexión'
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 3,
          listStyle: 'none',
          m: 0,
          p: 0
        }}
      >
        {['Conectar con Meta', 'Registrar el número', 'Gestionar plantillas'].map((label, index) => (
          <Stack
            key={label}
            component='li'
            direction='row'
            spacing={2}
            alignItems='center'
            aria-current={index === step ? 'step' : undefined}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: index === step ? 'primary.main' : 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 30,
                height: 30,
                flexShrink: 0,
                borderRadius: '50%',
                bgcolor: index <= step ? 'primary.lighterOpacity' : 'action.hover',
                color: index <= step ? 'primary.main' : 'text.secondary',
                fontWeight: 600
              }}
            >
              {index < step ? <i className='tabler-check' aria-hidden='true' /> : index + 1}
            </Box>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
          </Stack>
        ))}
      </Box>
      <WhatsappEmbeddedSignupPanel
        workspaceName={workspace?.name ?? null}
        isConfigured={configured}
        initialPhoneNumber={phoneNumber}
      />
      <Accordion
        disableGutters
        sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', '&:before': { display: 'none' } }}
      >
        <AccordionSummary
          expandIcon={<i className='tabler-chevron-down' />}
          id='manual-whatsapp-header'
          aria-controls='manual-whatsapp-content'
        >
          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: 600 }}>Configuración manual avanzada</Typography>
            <Typography variant='body2' color='text.secondary'>
              Vincular una cuenta existente mediante sus identificadores de Meta.
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails id='manual-whatsapp-content'>
          <WhatsappPhoneNumberPanel workspaceName={workspace?.name ?? null} initialPhoneNumber={phoneNumber} />
        </AccordionDetails>
      </Accordion>
      <WhatsappTemplatesPanel workspaceName={workspace?.name ?? null} initialTemplates={templates} />
    </Stack>
  )
}
