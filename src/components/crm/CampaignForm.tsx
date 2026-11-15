'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import RecordForm, { crmRequest, localDateTime } from './RecordForm'
import { lifecycleLabels, parseSegment } from '@/lib/crm/contracts'
import type { MarketingData } from '@/lib/crm/marketing-service'

type Campaign = MarketingData['campaigns'][number]
type Preview = { count: number; sample: { fullName: string | null; email: string | null }[] }

export default function CampaignForm({ campaign, onClose }: { campaign?: Campaign; onClose: () => void }) {
  const [segment, setSegment] = useState(
    campaign ? parseSegment(campaign.segment) : { lifecycle: '', tag: '', source: '' }
  )

  const [preview, setPreview] = useState<Preview | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')


return (
    <RecordForm
      title={campaign ? 'Editar campaña' : 'Nueva campaña'}
      onClose={onClose}
      submitLabel='Guardar borrador'
      onSave={values =>
        crmRequest(`campaigns${campaign ? `/${campaign.id}` : ''}`, { ...values, segment }, campaign ? 'PATCH' : 'POST')
      }
      fields={[
        { name: 'name', label: 'Nombre interno de la campaña', value: campaign?.name, required: true },
        { name: 'subject', label: 'Asunto del email', value: campaign?.subject, required: true },
        {
          name: 'body',
          label: 'Mensaje',
          value: campaign?.body,
          required: true,
          multiline: true,
          helper:
            'Texto simple. Personaliza con {{nombre}} y {{empresa}}. Se añade un enlace para cancelar la suscripción.'
        }
      ]}
    >
      <Typography variant='subtitle1' fontWeight={600}>
        Segmento de destinatarios
      </Typography>
      <TextField
        select
        label='Relación'
        value={segment.lifecycle}
        onChange={event => {
          setSegment({ ...segment, lifecycle: event.target.value })
          setPreview(null)
        }}
      >
        <MenuItem value=''>Todos los contactos</MenuItem>
        {Object.entries(lifecycleLabels).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label='Etiqueta exacta'
          value={segment.tag}
          onChange={event => {
            setSegment({ ...segment, tag: event.target.value })
            setPreview(null)
          }}
          fullWidth
        />
        <TextField
          label='Origen exacto'
          value={segment.source}
          onChange={event => {
            setSegment({ ...segment, source: event.target.value })
            setPreview(null)
          }}
          fullWidth
        />
      </Stack>
      <Typography variant='caption' color='text.secondary'>
        Los filtros se combinan. Solo se incluyen contactos con email, consentimiento y sin baja.
      </Typography>
      <Button
        variant='outlined'
        disabled={pending}
        onClick={async () => {
          setPending(true)
          setError('')

          try {
            setPreview(await crmRequest('segments/preview', segment))
          } catch (failure) {
            setError((failure as Error).message)
          } finally {
            setPending(false)
          }
        }}
      >
        {pending ? 'Calculando…' : 'Vista previa del segmento'}
      </Button>
      {error ? <Alert severity='error'>{error}</Alert> : null}
      {preview ? (
        <Alert severity='info'>
          <strong>{preview.count} destinatarios elegibles</strong>
          {preview.sample.map(contact => (
            <Typography key={contact.email} variant='body2'>
              {contact.fullName || 'Sin nombre'} · {contact.email}
            </Typography>
          ))}
        </Alert>
      ) : null}
    </RecordForm>
  )
}

export function ScheduleCampaignForm({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)


return (
    <RecordForm
      title='Revisar y programar campaña'
      submitLabel='Programar envío'
      onClose={onClose}
      fields={[
        {
          name: 'scheduledAt',
          label: 'Fecha y hora de envío',
          type: 'datetime-local',
          value: localDateTime(new Date(Date.now() + 3600000)),
          required: true,
          helper: 'Hora local. La campaña se procesa en la siguiente ejecución del servicio de envíos.'
        }
      ]}
      onSave={values => {
        if (!preview?.count) throw new Error('Revisa primero los destinatarios de la campaña.')

return crmRequest(`campaigns/${campaign.id}/schedule`, {
          scheduledAt: new Date(String(values.scheduledAt)).toISOString()
        })
      }}
    >
      <Typography variant='h6'>{campaign.name}</Typography>
      <Typography fontWeight={600}>{campaign.subject}</Typography>
      <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {campaign.body}
      </Typography>
      <Alert severity='info'>
        El mensaje se personaliza para cada contacto. Los destinatarios se fijan al programar; antes de cada envío se
        vuelve a comprobar el consentimiento.
      </Alert>
      <Button
        variant='outlined'
        disabled={pending}
        onClick={async () => {
          setPending(true)
          setError('')

          try {
            setPreview(await crmRequest('segments/preview', campaign.segment))
          } catch (failure) {
            setError((failure as Error).message)
          } finally {
            setPending(false)
          }
        }}
      >
        Revisar destinatarios
      </Button>
      {error ? <Alert severity='error'>{error}</Alert> : null}
      {preview ? (
        <Alert severity={preview.count ? 'success' : 'warning'}>
          {preview.count} destinatarios elegibles
          {preview.sample.map(contact => (
            <Typography variant='body2' key={contact.email}>
              {contact.email}
            </Typography>
          ))}
        </Alert>
      ) : null}
    </RecordForm>
  )
}
