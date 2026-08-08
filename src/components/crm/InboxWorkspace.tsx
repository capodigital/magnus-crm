'use client'

import { useEffect, useState, type FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type { InboxConversation } from '@/lib/crm/inbox-query'

type InboxWorkspaceProps = {
  workspaceName: string | null
  conversations: InboxConversation[]
}

type SendMessageResponse = {
  result?: {
    messageId: string
    metaMessageId: string
  }
  error?: string
}

type StatusFilter = 'ALL' | 'OPEN' | 'PENDING' | 'CLOSED'

const statusLabels: Record<string, string> = {
  OPEN: 'Abierta',
  PENDING: 'Pendiente',
  CLOSED: 'Cerrada',
  SPAM: 'Spam'
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  OPEN: 'success',
  PENDING: 'warning',
  CLOSED: 'default'
}

const filterLabels: Record<StatusFilter, string> = {
  ALL: 'Todas',
  OPEN: 'Abiertas',
  PENDING: 'Pendientes',
  CLOSED: 'Cerradas'
}

const getDisplayName = (conversation: InboxConversation) =>
  conversation.contact.fullName ??
  conversation.contact.firstName ??
  conversation.contact.phoneE164 ??
  conversation.contact.whatsappWaId ??
  'Contacto sin nombre'

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()

const formatTime = (value: string | null, includeDate = false) => {
  if (!value) return 'Sin mensajes'

  return new Intl.DateTimeFormat('es-419', {
    ...(includeDate ? { day: '2-digit', month: 'short' } : {}),
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

const getMessagePreview = (conversation: InboxConversation) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1]

  if (!lastMessage) return 'Todavia no hay mensajes'

  return lastMessage.bodyText ?? (lastMessage.mediaMimeType ? 'Mensaje multimedia' : 'Mensaje sin texto')
}

const InboxWorkspace = ({ workspaceName, conversations }: InboxWorkspaceProps) => {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [search, setSearch] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId || !conversations.some(conversation => conversation.id === selectedId)) {
      setSelectedId(conversations[0]?.id ?? null)
    }
  }, [conversations, selectedId])

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedConversation || !draft.trim() || isSending) return

    setIsSending(true)
    setSendError(null)

    try {
      const response = await fetch(`/api/inbox/conversations/${encodeURIComponent(selectedConversation.id)}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: draft })
      })

      const payload = (await response.json().catch(() => null)) as SendMessageResponse | null

      if (!response.ok || !payload?.result) {
        setSendError(payload?.error ?? 'No pudimos enviar el mensaje.')

        return
      }

      setDraft('')

      router.refresh()
    } catch {
      setSendError('No pudimos conectar con el servidor para enviar el mensaje.')
    } finally {
      setIsSending(false)
    }
  }

  const normalizedSearch = search.trim().toLowerCase()

  const filteredConversations = conversations.filter(conversation => {
    const matchesStatus = statusFilter === 'ALL' || conversation.status === statusFilter
    const searchableText = `${getDisplayName(conversation)} ${conversation.contact.phoneE164 ?? ''} ${getMessagePreview(conversation)}`.toLowerCase()

    return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch))
  })

  const selectedConversation = conversations.find(conversation => conversation.id === selectedId) ?? null

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    window.setTimeout(() => setIsRefreshing(false), 700)
  }

  return (
    <Stack spacing={3} sx={{ minWidth: 0 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' spacing={2}>
        <Stack spacing={0.75}>
          <Typography variant='overline' color='primary.main' sx={{ letterSpacing: 1.4, fontWeight: 700 }}>
            Bandeja de WhatsApp
          </Typography>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 800 }}>
            Conversaciones que necesitan contexto
          </Typography>
          <Typography color='text.secondary'>
            {workspaceName ? `Mensajes del workspace ${workspaceName}.` : 'Mensajes del workspace activo.'} Actualiza para
            ver los eventos recién recibidos desde Meta.
          </Typography>
        </Stack>
        <Button
          variant='outlined'
          startIcon={<i className='tabler-refresh' />}
          onClick={handleRefresh}
          disabled={isRefreshing}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
        >
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </Stack>

      <Card variant='outlined' sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(300px, 0.8fr) minmax(0, 1.5fr)' },
            minHeight: { xs: 'auto', lg: 650 }
          }}
        >
          <Box sx={{ borderInlineEnd: { lg: '1px solid' }, borderColor: 'divider', minWidth: 0 }}>
            <Stack spacing={2} sx={{ p: { xs: 3, md: 4 } }}>
              <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
                <Stack spacing={0.5}>
                  <Typography variant='h6' sx={{ fontWeight: 800 }}>
                    Conversaciones
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {conversations.length} {conversations.length === 1 ? 'hilo' : 'hilos'} recibidos
                  </Typography>
                </Stack>
                <Chip label='WhatsApp' color='success' size='small' variant='outlined' />
              </Stack>
              <TextField
                fullWidth
                size='small'
                label='Buscar contacto'
                value={search}
                onChange={event => setSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-search' aria-hidden='true' />
                    </InputAdornment>
                  )
                }}
              />
              <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                {(Object.keys(filterLabels) as StatusFilter[]).map(filter => (
                  <Button
                    key={filter}
                    size='small'
                    variant={statusFilter === filter ? 'contained' : 'text'}
                    onClick={() => setStatusFilter(filter)}
                  >
                    {filterLabels[filter]}
                  </Button>
                ))}
              </Stack>
            </Stack>
            <Divider />
            {filteredConversations.length ? (
              <List disablePadding aria-label='Conversaciones de WhatsApp'>
                {filteredConversations.map(conversation => {
                  const displayName = getDisplayName(conversation)

                  return (
                    <ListItemButton
                      key={conversation.id}
                      selected={conversation.id === selectedId}
                      onClick={() => setSelectedId(conversation.id)}
                      sx={{
                        alignItems: 'flex-start',
                        gap: 1.5,
                        px: { xs: 3, md: 4 },
                        py: 2,
                        borderBlockEnd: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 40, height: 40 }}>
                        {getInitials(displayName)}
                      </Avatar>
                      <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction='row' justifyContent='space-between' spacing={1}>
                          <Typography variant='subtitle2' noWrap sx={{ fontWeight: 700 }}>
                            {displayName}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' noWrap>
                            {formatTime(conversation.lastMessageAt)}
                          </Typography>
                        </Stack>
                        <Typography variant='body2' color='text.secondary' noWrap>
                          {getMessagePreview(conversation)}
                        </Typography>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Chip
                            label={statusLabels[conversation.status] ?? conversation.status}
                            color={statusColors[conversation.status] ?? 'default'}
                            size='small'
                            variant='outlined'
                          />
                          <Typography variant='caption' color='text.secondary'>
                            {conversation.messageCount} {conversation.messageCount === 1 ? 'mensaje' : 'mensajes'}
                          </Typography>
                        </Stack>
                      </Stack>
                    </ListItemButton>
                  )
                })}
              </List>
            ) : (
              <Stack spacing={1} alignItems='center' sx={{ px: 3, py: 8, textAlign: 'center' }}>
                <i
                  className={`${conversations.length ? 'tabler-search-off' : 'tabler-brand-whatsapp'} text-[2rem]`}
                  aria-hidden='true'
                />
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  {conversations.length ? 'No encontramos conversaciones' : 'Todavia no hay conversaciones'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {conversations.length
                    ? 'Prueba otra busqueda o cambia el filtro de estado.'
                    : 'Cuando un contacto escriba al numero productivo vinculado, el hilo aparecera aqui.'}
                </Typography>
              </Stack>
            )}
          </Box>

          <Box sx={{ minWidth: 0, bgcolor: 'background.default' }}>
            {selectedConversation ? (
              <Stack sx={{ height: '100%' }}>
                <Stack direction='row' alignItems='center' spacing={1.5} sx={{ p: { xs: 3, md: 4 } }}>
                  <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    {getInitials(getDisplayName(selectedConversation))}
                  </Avatar>
                  <Stack spacing={0.35} sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant='h6' noWrap sx={{ fontWeight: 800 }}>
                      {getDisplayName(selectedConversation)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' noWrap>
                      {selectedConversation.contact.phoneE164 ?? selectedConversation.contact.whatsappWaId ?? 'WhatsApp'}
                    </Typography>
                  </Stack>
                  <Chip
                    label={statusLabels[selectedConversation.status] ?? selectedConversation.status}
                    color={statusColors[selectedConversation.status] ?? 'default'}
                    size='small'
                  />
                  <IconButton aria-label='Actualizar conversación' onClick={handleRefresh} disabled={isRefreshing}>
                    <i className='tabler-refresh' aria-hidden='true' />
                  </IconButton>
                </Stack>
                <Divider />
                <Stack spacing={2} sx={{ flex: 1, p: { xs: 3, md: 4 }, overflowY: 'auto' }}>
                  <Stack spacing={0.5} alignItems='center' sx={{ pb: 1 }}>
                    <Chip label='Historial recibido desde Meta' size='small' variant='outlined' />
                    <Typography variant='caption' color='text.secondary'>
                      El composer de respuestas salientes se habilitara en el siguiente corte.
                    </Typography>
                  </Stack>
                  {selectedConversation.messages.length ? (
                    selectedConversation.messages.map(message => {
                      const isInbound = message.direction === 'INBOUND'

                      const messageText =
                        message.bodyText ?? (message.mediaMimeType ? `Mensaje ${message.mediaMimeType}` : 'Mensaje sin texto')

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
                              {formatTime(message.createdAt, true)}
                            </Typography>
                          </Paper>
                        </Stack>
                      )
                    })
                  ) : (
                    <Stack alignItems='center' spacing={1} sx={{ py: 8, textAlign: 'center' }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        Esta conversación aún no tiene mensajes
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                <Divider />
                <Stack component='form' spacing={1.5} onSubmit={handleSend} sx={{ p: { xs: 3, md: 4 } }}>
                  {sendError ? <Alert severity='error'>{sendError}</Alert> : null}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-end' }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={6}
                      label='Responder por WhatsApp'
                      placeholder='Escribe una respuesta...'
                      value={draft}
                      onChange={event => setDraft(event.target.value)}
                      disabled={isSending}
                      inputProps={{ maxLength: 4096, 'aria-label': 'Mensaje de respuesta' }}
                      helperText={`${draft.length}/4096 caracteres. Las respuestas de texto requieren una ventana activa de atencion.`}
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
              </Stack>
            ) : (
              <Stack alignItems='center' justifyContent='center' spacing={1.5} sx={{ minHeight: 500, p: 4, textAlign: 'center' }}>
                <i className='tabler-brand-whatsapp text-[3rem]' aria-hidden='true' />
                <Typography variant='h6' sx={{ fontWeight: 800 }}>
                  Selecciona una conversación
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 360 }}>
                  Cuando llegue un mensaje a tu número productivo y el teléfono esté vinculado al workspace, aparecerá aquí.
                </Typography>
              </Stack>
            )}
          </Box>
        </Box>
      </Card>
    </Stack>
  )
}

export default InboxWorkspace
