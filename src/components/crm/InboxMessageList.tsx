'use client'

import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { InboxMessage } from '@/lib/crm/inbox-query'

type InboxMessageListProps = {
  messages: InboxMessage[]
}

const formatMessageTime = (value: string, includeDate = false) =>
  new Intl.DateTimeFormat('es-419', {
    ...(includeDate ? { day: '2-digit', month: 'short' } : {}),
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))

const outboundStatusLabels: Record<string, string> = {
  sent: 'Enviado a Meta',
  delivered: 'Entregado',
  read: 'Leído',
  failed: 'No entregado'
}

const InboxMessageList = ({ messages }: InboxMessageListProps) => {
  if (!messages.length) {
    return (
      <Stack alignItems='center' spacing={1} sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
          Esta conversación aún no tiene mensajes
        </Typography>
      </Stack>
    )
  }

  return (
    <>
      {messages.map(message => {
        const isInbound = message.direction === 'INBOUND'
        const messageText = message.bodyText ?? (message.mediaMimeType ? `Mensaje ${message.mediaMimeType}` : 'Mensaje sin texto')

        return (
          <Stack key={message.id} alignItems={isInbound ? 'flex-start' : 'flex-end'}>
            <Paper
              elevation={0}
              sx={{
                maxWidth: { xs: '90%', sm: '75%' },
                px: 2,
                py: 1.5,
                bgcolor: isInbound ? 'background.paper' : 'primary.main',
                color: isInbound ? 'text.primary' : 'primary.contrastText',
                border: '1px solid',
                borderColor: isInbound ? 'divider' : 'primary.main',
                borderRadius: 3,
                borderBottomLeftRadius: isInbound ? 0.75 : 3,
                borderBottomRightRadius: isInbound ? 3 : 0.75
              }}
            >
              <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {messageText}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  mt: 0.75,
                  textAlign: 'right',
                  color: isInbound ? 'text.secondary' : 'rgba(255, 255, 255, 0.72)'
                }}
              >
                {formatMessageTime(message.createdAt, true)}
                {!isInbound ? ` · ${outboundStatusLabels[message.externalStatus ?? ''] ?? 'Enviando'}` : ''}
              </Typography>
            </Paper>
          </Stack>
        )
      })}
    </>
  )
}

export default InboxMessageList
