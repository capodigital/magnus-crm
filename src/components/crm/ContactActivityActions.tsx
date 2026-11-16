'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import ActivityForm from './ActivityForm'

const actions = [
  ['CALL', 'Llamada', 'tabler-phone'],
  ['EMAIL', 'Email', 'tabler-mail'],
  ['MEETING', 'Reunión', 'tabler-calendar-event'],
  ['TASK', 'Tarea', 'tabler-checkbox'],
  ['REMINDER', 'Recordatorio', 'tabler-bell']
]

export default function ContactActivityActions({ contactId }: { contactId: string }) {
  const [type, setType] = useState('')

  return (
    <>
      <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' aria-label='Registrar interacción'>
        {actions.map(([value, label, icon]) => (
          <Button
            key={value}
            variant='outlined'
            size='small'
            startIcon={<i className={icon} />}
            onClick={() => setType(value)}
          >
            Registrar {label.toLowerCase()}
          </Button>
        ))}
      </Stack>
      {type ? <ActivityForm contactId={contactId} initialType={type} onClose={() => setType('')} /> : null}
    </>
  )
}
