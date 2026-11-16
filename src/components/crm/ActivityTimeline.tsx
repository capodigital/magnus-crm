'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import EmptyState from './EmptyState'
import { crmRequest } from './RecordForm'
import { activityLabels } from '@/lib/crm/contracts'

export type TimelineItem = {
  id: string
  type: string
  title: string
  description: string | null
  occursAt: string
  completedAt: string | null
  contactId?: string
  contactName?: string | null
  emailStatus?: string
}

const icons: Record<string, string> = {
  CALL: 'tabler-phone',
  EMAIL: 'tabler-mail',
  MEETING: 'tabler-calendar-event',
  TASK: 'tabler-checkbox',
  REMINDER: 'tabler-bell',
  NOTE: 'tabler-note'
}

const emailLabels: Record<string, string> = {
  QUEUED: 'En cola',
  PROCESSING: 'Procesando',
  SENT: 'Enviado',
  SKIPPED: 'Omitido',
  FAILED: 'Fallido'
}

export default function ActivityTimeline({
  items,
  canWrite,
  filterable = true,
  ascending = false
}: {
  items: TimelineItem[]
  canWrite: boolean
  filterable?: boolean
  ascending?: boolean
}) {
  const [filter, setFilter] = useState('')
  const [pending, setPending] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const filtered = items
    .filter(item => !filter || item.type === filter)
    .toSorted((a, b) => (ascending ? a.occursAt.localeCompare(b.occursAt) : b.occursAt.localeCompare(a.occursAt)))

  return (
    <Stack spacing={3}>
      {filterable ? (
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          {[['', 'Todas'], ...Object.entries(activityLabels)].map(([value, label]) => (
            <Chip
              component='button'
              key={value}
              label={label}
              onClick={() => setFilter(value)}
              color={value === filter ? 'primary' : 'default'}
              variant={value === filter ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      ) : null}
      {error ? <Alert severity='error'>{error}</Alert> : null}
      {!filtered.length ? (
        <EmptyState
          icon='tabler-timeline'
          title='Sin interacciones en esta vista'
          description='Registra una llamada, reunión, tarea o recordatorio para mantener el seguimiento al día.'
        />
      ) : (
        filtered.map(item => {
          const actionable = ['TASK', 'REMINDER', 'MEETING'].includes(item.type) && !item.emailStatus

          return (
            <Stack key={item.id} direction='row' spacing={3} sx={{ alignItems: 'stretch' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'primary.lighterOpacity',
                    color: 'primary.main',
                    display: 'flex'
                  }}
                >
                  <i className={icons[item.type] || icons.NOTE} aria-hidden='true' />
                </Box>
                <Box sx={{ flex: 1, borderLeft: '1px solid', borderColor: 'divider', mt: 1 }} />
              </Box>
              <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0, pb: 4 }}>
                <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' alignItems='center'>
                  <Typography variant='subtitle1' fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Chip
                    size='small'
                    variant='outlined'
                    label={
                      item.emailStatus
                        ? emailLabels[item.emailStatus] || item.emailStatus
                        : activityLabels[item.type as keyof typeof activityLabels] || item.type
                    }
                  />
                  {actionable ? (
                    <Chip
                      size='small'
                      color={item.completedAt ? 'success' : 'warning'}
                      label={item.completedAt ? 'Completada' : 'Pendiente'}
                    />
                  ) : null}
                </Stack>
                <Typography variant='caption' color='text.secondary'>
                  {new Date(item.occursAt).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })}
                </Typography>
                {item.contactId ? (
                  <Typography variant='body2' component={Link} href={`/contacts/${item.contactId}`} color='primary'>
                    {item.contactName || 'Ver contacto'}
                  </Typography>
                ) : null}
                {item.description ? (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    {item.description}
                  </Typography>
                ) : null}
                {actionable && canWrite ? (
                  <Button
                    size='small'
                    sx={{ alignSelf: 'flex-start' }}
                    disabled={Boolean(pending)}
                    onClick={async () => {
                      setPending(item.id)
                      setError('')

                      try {
                        await crmRequest(`activities/${item.id}`, { completed: !item.completedAt }, 'PATCH')
                        router.refresh()
                      } catch (failure) {
                        setError((failure as Error).message)
                      } finally {
                        setPending('')
                      }
                    }}
                  >
                    {item.completedAt ? 'Reabrir' : 'Marcar completada'}
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          )
        })
      )}
    </Stack>
  )
}
