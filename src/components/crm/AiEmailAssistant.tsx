'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { crmRequest } from './RecordForm'

export default function AiEmailAssistant({
  action,
  onApply,
  onBusy
}: {
  action: 'campaign_email' | 'automation_email'
  onApply: (body: string) => void
  onBusy: (busy: boolean) => void
}) {
  const [brief, setBrief] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<{ body: string } | null>(null)

  return (
    <Stack spacing={2} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant='subtitle1' fontWeight={600}>
        Ayuda para redactar con IA
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        Describe lo que quieres comunicar y revisa el borrador antes de usarlo.
      </Typography>
      <TextField
        label='Objetivo del email para la IA'
        value={brief}
        onChange={event => setBrief(event.target.value)}
        multiline
        minRows={2}
        disabled={pending}
        inputProps={{ maxLength: 4000 }}
      />
      <Button
        variant='outlined'
        disabled={pending || !brief.trim()}
        startIcon={<i className='tabler-sparkles' />}
        onClick={async () => {
          setPending(true)
          onBusy(true)
          setError('')
          setDraft(null)

          try {
            setDraft(await crmRequest('ai/email', { action, brief }))
          } catch (failure) {
            setError((failure as Error).message)
          } finally {
            setPending(false)
            onBusy(false)
          }
        }}
      >
        {pending ? 'Generando borrador…' : 'Redactar email con IA'}
      </Button>
      {error ? <Alert severity='error'>{error}</Alert> : null}
      {draft ? (
        <>
          <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {draft.body}
          </Typography>
          <Button
            onClick={() => {
              onApply(draft.body)
              setDraft(null)
            }}
          >
            Usar este borrador en el mensaje
          </Button>
        </>
      ) : null}
    </Stack>
  )
}
