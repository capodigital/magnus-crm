'use client'

import { useEffect, useState, type FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type { InboxConversation } from '@/lib/crm/inbox-query'
import { formatReplyWindowRemaining, getWhatsappReplyWindowFromIso } from '@/lib/whatsapp/reply-window'
import type { WhatsappTemplateView } from '@/lib/whatsapp/template-contract'
import { getWhatsappTemplateVariableIndexes, renderWhatsappTemplateBody } from '@/lib/whatsapp/template-utils'

type InboxComposerProps = {
  conversation: InboxConversation
  templates: WhatsappTemplateView[]
  now: number
}

type SendMessageResponse = {
  result?: {
    messageId: string
    metaMessageId: string
  }
  error?: string
}

type ComposerMode = 'TEXT' | 'TEMPLATE'

const InboxComposer = ({ conversation, templates, now }: InboxComposerProps) => {
  const router = useRouter()

  const approvedTemplates = templates.filter(
    template => template.status === 'APPROVED' && template.category !== 'AUTHENTICATION'
  )

  const firstApprovedTemplateId = approvedTemplates[0]?.id ?? null
  const replyWindow = getWhatsappReplyWindowFromIso(conversation.lastInboundAt, now)
  const [mode, setMode] = useState<ComposerMode>(replyWindow.isOpen ? 'TEXT' : 'TEMPLATE')
  const [draft, setDraft] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState(approvedTemplates[0]?.id ?? '')
  const [variables, setVariables] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const selectedTemplate = approvedTemplates.find(template => template.id === selectedTemplateId) ?? null
  const selectedTemplateBody = selectedTemplate?.bodyText ?? null
  const variableIndexes = selectedTemplate ? getWhatsappTemplateVariableIndexes(selectedTemplate.bodyText) : []
  const previewBody = selectedTemplate ? renderWhatsappTemplateBody(selectedTemplate.bodyText, variables) : ''

  useEffect(() => {
    if (!selectedTemplateId && firstApprovedTemplateId) {
      setSelectedTemplateId(firstApprovedTemplateId)
    }
  }, [firstApprovedTemplateId, selectedTemplateId])

  useEffect(() => {
    const nextVariableIndexes = selectedTemplateBody ? getWhatsappTemplateVariableIndexes(selectedTemplateBody) : []

    setVariables(nextVariableIndexes.map(() => ''))
  }, [selectedTemplateId, selectedTemplateBody])

  useEffect(() => {
    if (!replyWindow.isOpen && mode === 'TEXT') {
      setMode('TEMPLATE')
    }
  }, [mode, replyWindow.isOpen])

  const send = async (url: string, body: Record<string, unknown>) => {
    setIsSending(true)
    setSendError(null)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const payload = (await response.json().catch(() => null)) as SendMessageResponse | null

      if (!response.ok || !payload?.result) {
        setSendError(payload?.error ?? 'No pudimos enviar el mensaje.')

        return false
      }

      router.refresh()

      return true
    } catch {
      setSendError('No pudimos conectar con el servidor para enviar el mensaje.')

      return false
    } finally {
      setIsSending(false)
    }
  }

  const handleTextSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!replyWindow.isOpen || !draft.trim() || isSending) return

    const sent = await send(`/api/inbox/conversations/${encodeURIComponent(conversation.id)}/messages`, { body: draft })

    if (sent) setDraft('')
  }

  const handleTemplateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedTemplate || isSending || variables.some(variable => !variable.trim())) return

    const sent = await send(`/api/inbox/conversations/${encodeURIComponent(conversation.id)}/template-messages`, {
      templateId: selectedTemplate.id,
      variables
    })

    if (sent) setVariables(variableIndexes.map(() => ''))
  }

  const statusLabel = replyWindow.isOpen
    ? `Ventana abierta · quedan ${formatReplyWindowRemaining(replyWindow.remainingMs)}`
    : 'Ventana cerrada · usa una plantilla'

  return (
    <Stack spacing={1.5} sx={{ p: { xs: 3, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
            Responder a este cliente
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {replyWindow.expiresAt
              ? `${statusLabel}. La ventana termina a las ${new Intl.DateTimeFormat('es-419', {
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(replyWindow.expiresAt)}.`
              : statusLabel}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Button
            size='small'
            variant={mode === 'TEXT' ? 'contained' : 'outlined'}
            onClick={() => setMode('TEXT')}
            disabled={!replyWindow.isOpen || isSending}
          >
            Texto libre
          </Button>
          <Button
            size='small'
            variant={mode === 'TEMPLATE' ? 'contained' : 'outlined'}
            onClick={() => setMode('TEMPLATE')}
            disabled={!approvedTemplates.length || isSending}
          >
            Plantilla
          </Button>
        </Stack>
      </Stack>

      {sendError ? <Alert severity='error'>{sendError}</Alert> : null}

      {mode === 'TEXT' ? (
        <Stack component='form' spacing={1.5} onSubmit={handleTextSubmit}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              label='Mensaje de respuesta'
              placeholder='Escribe una respuesta...'
              value={draft}
              onChange={event => setDraft(event.target.value)}
              disabled={isSending}
              inputProps={{ maxLength: 4096, 'aria-label': 'Mensaje de respuesta' }}
              helperText={`${draft.length}/4096 caracteres. Puedes responder con texto libre mientras la ventana esté abierta.`}
            />
            <Button
              type='submit'
              variant='contained'
              disabled={!draft.trim() || isSending}
              startIcon={<i className='tabler-send' aria-hidden='true' />}
              sx={{ minWidth: { sm: 132 }, minHeight: 42 }}
            >
              {isSending ? 'Enviando...' : 'Enviar'}
            </Button>
          </Stack>
        </Stack>
      ) : approvedTemplates.length ? (
        <Stack component='form' spacing={1.5} onSubmit={handleTemplateSubmit}>
          <TextField
            select
            fullWidth
            label='Plantilla aprobada'
            value={selectedTemplateId}
            onChange={event => setSelectedTemplateId(event.target.value)}
            disabled={isSending}
          >
            {approvedTemplates.map(template => (
              <MenuItem key={template.id} value={template.id}>
                {template.name} · {template.language}
              </MenuItem>
            ))}
          </TextField>
          {selectedTemplate ? (
            <Paper variant='outlined' sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant='caption' color='text.secondary'>
                Vista previa
              </Typography>
              <Typography variant='body2' sx={{ mt: 0.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {previewBody}
              </Typography>
            </Paper>
          ) : null}
          {selectedTemplate && variableIndexes.length ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {variableIndexes.map((variableIndex, index) => (
                <TextField
                  key={variableIndex}
                  fullWidth
                  required
                  label={`Valor para {{${variableIndex}}}`}
                  value={variables[index] ?? ''}
                  onChange={event =>
                    setVariables(current => current.map((value, currentIndex) => (currentIndex === index ? event.target.value : value)))
                  }
                  disabled={isSending}
                />
              ))}
            </Stack>
          ) : null}
          <Button
            type='submit'
            variant='contained'
            disabled={!selectedTemplate || variables.some(variable => !variable.trim()) || isSending}
            startIcon={<i className='tabler-send' aria-hidden='true' />}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, minHeight: 42 }}
          >
            {isSending ? 'Enviando...' : 'Enviar plantilla'}
          </Button>
        </Stack>
      ) : (
        <Alert severity='warning'>
          Todavía no tienes plantillas aprobadas. Crea una en{' '}
          <Button href='/settings' size='small' sx={{ verticalAlign: 'baseline', p: 0, minWidth: 0 }}>
            Configuración de WhatsApp
          </Button>
          .
        </Alert>
      )}
    </Stack>
  )
}

export default InboxComposer
