'use client'

import { useState } from 'react'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import ActivityForm from './ActivityForm'
import ActivityTimeline from './ActivityTimeline'
import ContactForm from './ContactForm'
import ProposalsPanel from './ProposalsPanel'
import EmptyState from './EmptyState'
import { displayName, lifecycleLabels, formatMoney, statusLabels } from '@/lib/crm/contracts'
import type { ContactDetail } from '@/lib/crm/records-query'

export default function ContactWorkspace({
  contact,
  canWrite,
  aiReady
}: {
  contact: ContactDetail
  canWrite: boolean
  aiReady: boolean
}) {
  const [tab, setTab] = useState('timeline')
  const [modal, setModal] = useState<'edit' | 'activity' | null>(null)

  const items = [
    ...contact.activities.map(activity => ({ ...activity, contactId: undefined })),
    ...contact.emailDeliveries.map(email => ({
      id: email.id,
      type: 'EMAIL',
      title: email.subject,
      description: email.error || email.body,
      occursAt: email.sentAt || email.dueAt,
      completedAt: email.sentAt,
      emailStatus: email.status
    }))
  ]

  return (
    <Stack spacing={4}>
      <Button href='/contacts' startIcon={<i className='tabler-arrow-left' />} sx={{ alignSelf: 'flex-start' }}>
        Todos los contactos
      </Button>
      <Card sx={{ p: { xs: 3, md: 5 } }}>
        <Stack direction='row' spacing={3} alignItems='center' useFlexGap flexWrap='wrap'>
          <Avatar
            sx={{
              width: { xs: 48, sm: 64 },
              height: { xs: 48, sm: 64 },
              bgcolor: 'primary.lighterOpacity',
              color: 'primary.main',
              fontSize: 28
            }}
          >
            {displayName(contact).charAt(0)}
          </Avatar>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 180 }}>
            <Typography variant='h4' component='h1'>
              {displayName(contact)}
            </Typography>
            <Typography color='text.secondary'>
              {[contact.jobTitle, contact.company].filter(Boolean).join(' · ') || 'Ficha de contacto'}
            </Typography>
            <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
              <Chip
                size='small'
                color={contact.lifecycle === 'CUSTOMER' ? 'success' : 'default'}
                label={lifecycleLabels[contact.lifecycle as keyof typeof lifecycleLabels]}
              />
              {contact.tags.map(tag => (
                <Chip key={tag} label={tag} size='small' variant='outlined' />
              ))}
            </Stack>
          </Stack>
          {canWrite ? (
            <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap' sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button variant='outlined' onClick={() => setModal('edit')}>
                Editar contacto
              </Button>
              <Button variant='contained' onClick={() => setModal('activity')}>
                Nueva interacción
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </Card>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr)' },
          gap: 4,
          alignItems: 'start'
        }}
      >
        <Stack spacing={3} sx={{ order: { xs: 2, lg: 0 } }}>
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
        <Card sx={{ minWidth: 0 }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant='scrollable'
            scrollButtons='auto'
            aria-label='Detalles del contacto'
          >
            {[
              ['timeline', 'Interacciones'],
              ['chats', 'Chats'],
              ['proposals', 'Propuestas IA'],
              ['deals', 'Negocios']
            ].map(([value, label]) => (
              <Tab
                key={value}
                id={`contact-tab-${value}`}
                aria-controls={`contact-panel-${value}`}
                value={value}
                label={label}
              />
            ))}
          </Tabs>
          <Divider />
          <Box
            sx={{ p: { xs: 3, md: 4 } }}
            role='tabpanel'
            id={`contact-panel-${tab}`}
            aria-labelledby={`contact-tab-${tab}`}
          >
            {tab === 'timeline' ? (
              <Stack spacing={2}>
                <ActivityTimeline items={items} canWrite={canWrite} />
                <Typography variant='caption' color='text.secondary'>
                  Últimas 100 interacciones y 100 emails. Consulta la agenda para ver todo el historial registrado.
                </Typography>
              </Stack>
            ) : null}
            {tab === 'proposals' ? <ProposalsPanel contact={contact} canWrite={canWrite} aiReady={aiReady} /> : null}
            {tab === 'chats' ? (
              <Stack spacing={3}>
                {contact.conversations.length ? (
                  contact.conversations.map(chat => (
                    <Card key={chat.id} variant='outlined' sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction='row' justifyContent='space-between'>
                          <Typography variant='h6'>WhatsApp</Typography>
                          <Button href={`/inbox?conversation=${chat.id}`}>Abrir conversación</Button>
                        </Stack>
                        {[...chat.messages].reverse().map(message => (
                          <Box
                            key={message.id}
                            sx={{
                              bgcolor: message.direction === 'OUTBOUND' ? 'primary.lighterOpacity' : 'action.hover',
                              p: 2,
                              borderRadius: 1,
                              ml: message.direction === 'OUTBOUND' ? 4 : 0,
                              mr: message.direction === 'INBOUND' ? 4 : 0
                            }}
                          >
                            <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                              {message.bodyText || 'Mensaje multimedia'}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {new Date(message.createdAt).toLocaleString('es')}
                            </Typography>
                          </Box>
                        ))}
                        <Typography variant='caption'>Últimos 30 mensajes de este chat.</Typography>
                      </Stack>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon='tabler-messages'
                    title='Todavía no hay chats'
                    description='Aquí aparecerán las conversaciones de este contacto en tus canales conectados.'
                  />
                )}
              </Stack>
            ) : null}
            {tab === 'deals' ? (
              <Stack spacing={2}>
                {contact.leads.length ? (
                  contact.leads.map(lead => (
                    <Card key={lead.id} variant='outlined' sx={{ p: 3 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' spacing={2}>
                        <Stack>
                          <Typography fontWeight={600}>{lead.title}</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {lead.kind === 'LEAD' ? 'Lead' : 'Oportunidad'} · {lead.stage?.name || 'Sin etapa'} ·{' '}
                            {statusLabels[lead.status]}
                          </Typography>
                        </Stack>
                        <Typography>{formatMoney(lead.valueCents, lead.currency)}</Typography>
                      </Stack>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon='tabler-target-arrow'
                    title='Sin negocios asociados'
                    description='Crea un lead o una oportunidad para este contacto desde Ventas.'
                  />
                )}
                <Button href='/opportunities' sx={{ alignSelf: 'flex-start' }}>
                  Gestionar oportunidades
                </Button>
              </Stack>
            ) : null}
          </Box>
        </Card>
      </Box>
      {modal === 'edit' ? (
        <ContactForm contact={contact} onClose={() => setModal(null)} />
      ) : modal === 'activity' ? (
        <ActivityForm contactId={contact.id} onClose={() => setModal(null)} />
      ) : null}
    </Stack>
  )
}
