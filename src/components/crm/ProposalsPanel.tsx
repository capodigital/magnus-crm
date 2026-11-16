'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import RecordForm, { crmRequest } from './RecordForm'
import EmptyState from './EmptyState'
import type { ContactDetail } from '@/lib/crm/records-query'

export default function ProposalsPanel({ contact, canWrite }: { contact: ContactDetail; canWrite: boolean }) {
  const [editing, setEditing] = useState<ContactDetail['proposals'][number] | 'new' | 'ai' | null>(null)
  const proposal = typeof editing === 'object' ? editing : null

  return (
    <Stack spacing={3}>
      <Alert severity='info'>
        Las propuestas son borradores para revisión. Generar con IA utiliza el objetivo, las notas y las últimas
        interacciones del contacto; no envía la propuesta al cliente.
      </Alert>
      {canWrite ? (
        <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap'>
          <Button variant='contained' onClick={() => setEditing('ai')} startIcon={<i className='tabler-sparkles' />}>
            Generar propuesta IA
          </Button>
          <Button variant='outlined' onClick={() => setEditing('new')}>
            Redactar propuesta
          </Button>
        </Stack>
      ) : null}
      {contact.proposals.length ? (
        contact.proposals.map(item => (
          <Card key={item.id} variant='outlined' sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction='row' spacing={2} justifyContent='space-between' alignItems='center'>
                <Typography variant='h6'>{item.title}</Typography>
                <Chip size='small' label={item.aiGenerated ? 'Borrador IA' : 'Borrador'} />
              </Stack>
              <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {item.body}
              </Typography>
              {canWrite ? (
                <Button onClick={() => setEditing(item)} sx={{ alignSelf: 'flex-start' }}>
                  Editar propuesta
                </Button>
              ) : null}
            </Stack>
          </Card>
        ))
      ) : (
        <EmptyState
          icon='tabler-file-text'
          title='Prepara la próxima propuesta'
          description='Redacta una propuesta o genera un primer borrador a partir del contexto del contacto.'
        />
      )}
      {editing === 'ai' ? (
        <RecordForm
          title='Generar propuesta con IA'
          submitLabel='Generar borrador'
          onClose={() => setEditing(null)}
          fields={[
            {
              name: 'brief',
              label: '¿Qué quieres proponer?',
              multiline: true,
              required: true,
              helper: 'Describe el servicio, alcance, presupuesto acordado y objetivo.'
            }
          ]}
          onSave={values => crmRequest('proposals/generate', { ...values, contactId: contact.id })}
        />
      ) : editing ? (
        <RecordForm
          title={proposal ? 'Editar propuesta' : 'Nueva propuesta'}
          onClose={() => setEditing(null)}
          fields={[
            { name: 'title', label: 'Título', value: proposal?.title, required: true },
            { name: 'body', label: 'Propuesta', value: proposal?.body, multiline: true, required: true }
          ]}
          onSave={values =>
            crmRequest(
              `proposals${proposal ? `/${proposal.id}` : ''}`,
              { ...values, contactId: contact.id },
              proposal ? 'PATCH' : 'POST'
            )
          }
        />
      ) : null}
    </Stack>
  )
}
