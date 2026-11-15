'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'

import ActivityForm from './ActivityForm'
import ActivityTimeline from './ActivityTimeline'
import type { TimelineItem } from './ActivityTimeline'
import PageHeading from './PageHeading'

export default function ActivitiesWorkspace({
  items,
  canWrite,
  pending
}: {
  items: TimelineItem[]
  canWrite: boolean
  pending: boolean
}) {
  const [creating, setCreating] = useState(false)

  return (
    <Stack spacing={4}>
      <PageHeading
        eyebrow='CRM / Seguimiento'
        title='Interacciones y agenda'
        description='Llamadas, emails registrados, reuniones, tareas y recordatorios de tu equipo.'
        action={
          canWrite ? (
            <Button variant='contained' onClick={() => setCreating(true)}>
              Nueva interacción
            </Button>
          ) : undefined
        }
      />
      <Stack direction='row' spacing={2}>
        <Button href='/activities' variant={!pending ? 'contained' : 'outlined'}>
          Todo el historial
        </Button>
        <Button href='/activities?pending=1' variant={pending ? 'contained' : 'outlined'}>
          Agenda pendiente
        </Button>
      </Stack>
      <Card sx={{ p: { xs: 3, md: 5 } }}>
        <ActivityTimeline items={items} canWrite={canWrite} filterable={false} ascending={pending} />
      </Card>
      {creating ? <ActivityForm onClose={() => setCreating(false)} /> : null}
    </Stack>
  )
}
