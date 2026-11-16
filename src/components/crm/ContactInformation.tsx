import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { ContactDetail } from '@/lib/crm/records-query'

export default function ContactInformation({ contact }: { contact: ContactDetail }) {
  return (
    <Stack spacing={3}>
      <Card sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography variant='h6'>Información de contacto</Typography>
          {[
            ['Email', contact.email],
            ['Teléfono', contact.phoneE164],
            ['Empresa', contact.company],
            ['Origen', contact.source]
          ].map(([label, value]) => (
            <Stack key={label} spacing={0.5}>
              <Typography variant='caption' color='text.secondary'>
                {label}
              </Typography>
              <Typography variant='body2' sx={{ overflowWrap: 'anywhere' }}>
                {value || 'Sin especificar'}
              </Typography>
            </Stack>
          ))}
          <Divider />
          <Typography variant='caption' color='text.secondary'>
            Email marketing
          </Typography>
          <Chip
            size='small'
            label={
              contact.unsubscribedAt
                ? 'Dado de baja'
                : contact.marketingConsent
                  ? 'Consentimiento registrado'
                  : 'Sin consentimiento'
            }
            variant='outlined'
          />
          <Typography variant='caption' color='text.secondary'>
            Alta: {new Date(contact.createdAt).toLocaleDateString('es')}
          </Typography>
        </Stack>
      </Card>
      <Card sx={{ p: 4 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Notas
        </Typography>
        <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {contact.notes || 'Añade contexto útil para tu equipo desde Editar contacto.'}
        </Typography>
      </Card>
    </Stack>
  )
}
