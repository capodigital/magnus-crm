'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import PageHeading from './PageHeading'
import EmptyState from './EmptyState'
import CampaignForm, { ScheduleCampaignForm } from './CampaignForm'
import AutomationForm from './AutomationForm'
import { crmRequest } from './RecordForm'
import { triggerLabels } from '@/lib/crm/contracts'
import type { MarketingData } from '@/lib/crm/marketing-service'
import type { SalesOptions } from '@/lib/crm/records-query'

const campaignLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SCHEDULED: 'Programada',
  SENDING: 'En curso',
  COMPLETED: 'Procesada',
  PAUSED: 'Pausada'
}

const deliveryLabels: Record<string, string> = {
  QUEUED: 'En cola',
  PROCESSING: 'Procesando',
  SENT: 'Enviado',
  FAILED: 'Fallido',
  SKIPPED: 'Omitido'
}

export default function MarketingWorkspace({
  data,
  options,
  canMarket,
  mode
}: {
  data: MarketingData
  options: SalesOptions
  canMarket: boolean
  mode: 'campaigns' | 'automations'
}) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<MarketingData['campaigns'][number] | 'new' | null>(null)
  const [schedule, setSchedule] = useState<MarketingData['campaigns'][number] | null>(null)
  const [rule, setRule] = useState<MarketingData['automations'][number] | 'new' | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const run = async (path: string) => {
    setPending(true)
    setError('')

    try {
      await crmRequest(path, {})
      router.refresh()
    } catch (failure) {
      setError((failure as Error).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Stack spacing={4}>
      <PageHeading
        eyebrow='Marketing / Email'
        title={mode === 'campaigns' ? 'Campañas' : 'Automatizaciones'}
        description={
          mode === 'campaigns'
            ? 'Segmenta tu audiencia, prepara el mensaje y programa la próxima conversación.'
            : 'Mantén el seguimiento activo con emails que responden a los eventos de tu CRM.'
        }
        action={
          canMarket ? (
            <Button variant='contained' onClick={() => (mode === 'campaigns' ? setCampaign('new') : setRule('new'))}>
              {mode === 'campaigns' ? 'Nueva campaña' : 'Nueva automatización'}
            </Button>
          ) : undefined
        }
      />
      {!data.email.ready ? (
        <Alert severity='warning'>
          Los envíos no están disponibles en este momento. Puedes seguir preparando y guardando borradores.
        </Alert>
      ) : null}
      {!canMarket ? (
        <Alert severity='info'>
          Puedes consultar el historial. La gestión de campañas y reglas corresponde a los administradores.
        </Alert>
      ) : null}
      {error ? <Alert severity='error'>{error}</Alert> : null}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {[
          ['QUEUED', 'Emails en cola'],
          ['SENT', 'Emails enviados'],
          ['FAILED', 'Fallidos'],
          ['SKIPPED', 'Omitidos']
        ].map(([status, label]) => (
          <Card key={status} sx={{ p: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              {label}
            </Typography>
            <Typography variant='h3' sx={{ mt: 1 }}>
              {data.statuses.find(s => s.status === status)?._count._all ?? 0}
            </Typography>
          </Card>
        ))}
      </Box>
      {mode === 'campaigns' ? (
        <Stack spacing={3}>
          {data.campaigns.length ? (
            data.campaigns.map(item => (
              <Card key={item.id} sx={{ p: 4 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                  <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction='row' spacing={2} alignItems='center'>
                      <Typography variant='h6'>{item.name}</Typography>
                      <Chip label={campaignLabels[item.status] || item.status} size='small' variant='outlined' />
                    </Stack>
                    <Typography color='text.secondary'>{item.subject}</Typography>
                    <Typography variant='caption'>
                      {item._count.deliveries} destinatarios
                      {item.scheduledAt
                        ? ` · ${new Date(item.scheduledAt).toLocaleString('es')}`
                        : ' · Segmento definido en el borrador'}
                    </Typography>
                  </Stack>
                  {canMarket ? (
                    <Stack direction='row' spacing={2}>
                      {item.status === 'DRAFT' ? (
                        <>
                          <Button onClick={() => setCampaign(item)}>Editar</Button>
                          <Button variant='outlined' disabled={!data.email.ready} onClick={() => setSchedule(item)}>
                            Revisar y programar
                          </Button>
                        </>
                      ) : item.status === 'PAUSED' ? (
                        <Button
                          disabled={pending || !data.email.ready}
                          onClick={() => run(`campaigns/${item.id}/resume`)}
                        >
                          Reanudar
                        </Button>
                      ) : ['SCHEDULED', 'SENDING'].includes(item.status) ? (
                        <Button disabled={pending} onClick={() => run(`campaigns/${item.id}/pause`)}>
                          Pausar
                        </Button>
                      ) : null}
                    </Stack>
                  ) : null}
                </Stack>
              </Card>
            ))
          ) : (
            <Card>
              <EmptyState
                icon='tabler-speakerphone'
                title='Tu próxima campaña empieza aquí'
                description='Crea un segmento, redacta el email y revisa los destinatarios antes de programar.'
              />
            </Card>
          )}
        </Stack>
      ) : (
        <Stack spacing={3}>
          {data.automations.length ? (
            data.automations.map(item => (
              <Card key={item.id} sx={{ p: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Stack direction='row' spacing={2}>
                      <Typography variant='h6'>{item.name}</Typography>
                      <Chip
                        size='small'
                        color={item.active ? 'success' : 'default'}
                        label={item.active ? 'Activa' : 'Pausada'}
                      />
                    </Stack>
                    <Typography color='text.secondary'>
                      {triggerLabels[item.trigger as keyof typeof triggerLabels]} → esperar {item.delayMinutes} min →
                      enviar email
                    </Typography>
                    <Typography variant='body2'>{item.subject}</Typography>
                  </Stack>
                  {canMarket ? (
                    <Button variant='outlined' onClick={() => setRule(item)}>
                      Gestionar regla
                    </Button>
                  ) : null}
                </Stack>
              </Card>
            ))
          ) : (
            <Card>
              <EmptyState
                icon='tabler-bolt'
                title='Automatiza el próximo seguimiento'
                description='Configura un email de bienvenida o un seguimiento cuando un negocio cambie de etapa.'
              />
            </Card>
          )}
        </Stack>
      )}
      <Card>
        <Stack spacing={1} sx={{ p: 3 }}>
          <Typography variant='h6'>Historial de envíos</Typography>
          <Typography variant='body2' color='text.secondary'>
            Últimos 50 emails. El estado Enviado no confirma la entrega ni la lectura del mensaje.
          </Typography>
        </Stack>
        {data.deliveries.length ? (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label='Historial de envíos'>
              <TableHead>
                <TableRow>
                  {['Destinatario', 'Asunto', 'Estado', 'Programado / enviado'].map(label => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.deliveries.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Button href={`/contacts/${item.contactId}`} size='small'>
                        {item.toEmail}
                      </Button>
                    </TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        color={item.status === 'FAILED' ? 'error' : item.status === 'SENT' ? 'success' : 'default'}
                        label={deliveryLabels[item.status]}
                      />
                      {item.error ? (
                        <Typography variant='caption' display='block' sx={{ mt: 1 }}>
                          {item.error}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{new Date(item.sentAt || item.dueAt).toLocaleString('es')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState
            icon='tabler-mail'
            title='Aún no hay envíos'
            description='Los emails de tus campañas y reglas aparecerán aquí con su estado.'
          />
        )}
      </Card>
      <Typography variant='caption' color='text.secondary'>
        Se muestran las últimas 100 campañas y reglas. Pausar detiene los envíos pendientes; un email ya en
        procesamiento puede finalizar.
      </Typography>
      {campaign ? (
        <CampaignForm campaign={campaign === 'new' ? undefined : campaign} onClose={() => setCampaign(null)} />
      ) : null}
      {schedule ? <ScheduleCampaignForm campaign={schedule} onClose={() => setSchedule(null)} /> : null}
      {rule ? (
        <AutomationForm rule={rule === 'new' ? undefined : rule} options={options} onClose={() => setRule(null)} />
      ) : null}
    </Stack>
  )
}
