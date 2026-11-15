'use client'

import { useState } from 'react'

import Link from 'next/link'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import PageHeading from './PageHeading'
import LeadForm from './LeadForm'
import RecordForm, { crmRequest } from './RecordForm'
import { displayName, formatMoney } from '@/lib/crm/contracts'
import type { SalesList, SalesOptions } from '@/lib/crm/records-query'

type Stage = SalesOptions['pipelines'][number]['stages'][number]

export default function PipelineWorkspace({
  options,
  leads,
  canWrite
}: {
  options: SalesOptions
  leads: SalesList['records']
  canWrite: boolean
}) {
  const [editing, setEditing] = useState<SalesList['records'][number] | null>(null)
  const [stage, setStage] = useState<Stage | 'new' | null>(null)
  const [pipelineId, setPipelineId] = useState('')
  const [newPipeline, setNewPipeline] = useState(false)
  const [kind, setKind] = useState('')
  const stageIds = new Set(options.pipelines.flatMap(p => p.stages.map(s => s.id)))
  const filtered = leads.filter(lead => !kind || lead.kind === kind)
  const unassigned = filtered.filter(lead => !lead.stageId || !stageIds.has(lead.stageId))

  const boards = options.pipelines.map(p => ({
    ...p,
    stages: p.stages.map(s => ({ ...s, leads: filtered.filter(l => l.stageId === s.id) }))
  }))

  const editingStage = stage && stage !== 'new' ? stage : null

  const leadCard = (lead: SalesList['records'][number]) => (
    <Card key={lead.id} variant='outlined' sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
          {lead.title}
        </Typography>
        <Typography variant='body2' color='primary' component={Link} href={`/contacts/${lead.contactId}`}>
          {displayName(lead.contact)}
        </Typography>
        <Typography variant='body2'>{formatMoney(lead.valueCents, lead.currency)}</Typography>
        <Stack direction='row' spacing={1} justifyContent='space-between' useFlexGap flexWrap='wrap'>
          <Chip size='small' label={lead.kind === 'LEAD' ? 'Lead' : 'Oportunidad'} />
          {canWrite ? (
            <Button size='small' onClick={() => setEditing(lead)}>
              Mover / editar
            </Button>
          ) : (
            <Button href={`/contacts/${lead.contactId}`} size='small'>
              Ver
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  )


return (
    <Stack spacing={4}>
      <PageHeading
        eyebrow='CRM / Ventas'
        title='Etapas comerciales'
        description='Organiza leads y oportunidades, define etapas y acompaña cada negocio hasta su cierre.'
        action={
          canWrite ? (
            <Button variant='outlined' onClick={() => setNewPipeline(true)}>
              Nuevo pipeline
            </Button>
          ) : undefined
        }
      />
      <Stack direction='row' spacing={2}>
        {[
          ['', 'Todos'],
          ['LEAD', 'Leads'],
          ['OPPORTUNITY', 'Oportunidades']
        ].map(([value, label]) => (
          <Button key={value} variant={kind === value ? 'contained' : 'outlined'} onClick={() => setKind(value)}>
            {label}
          </Button>
        ))}
      </Stack>
      {boards.map(board => (
        <Stack key={board.id} spacing={3}>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Typography variant='h5'>{board.name}</Typography>
            {canWrite ? (
              <Button
                onClick={() => {
                  setPipelineId(board.id)
                  setStage('new')
                }}
              >
                Añadir etapa
              </Button>
            ) : null}
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: `repeat(${Math.min(board.stages.length || 1, 4)}, minmax(0, 1fr))`
              }
            }}
          >
            {board.stages.map(column => (
              <Box
                key={column.id}
                sx={{
                  bgcolor: 'action.hover',
                  p: 3,
                  borderRadius: 2,
                  borderTop: '3px solid',
                  borderColor: column.color || 'primary.main',
                  minWidth: 0
                }}
              >
                <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between' sx={{ mb: 3 }}>
                  <Typography fontWeight={600}>{column.name}</Typography>
                  <Chip size='small' label={column.leads.length} />
                  {canWrite ? (
                    <Button size='small' aria-label={`Editar etapa ${column.name}`} onClick={() => setStage(column)}>
                      Editar
                    </Button>
                  ) : null}
                </Stack>
                <Stack spacing={2}>
                  {column.leads.length ? (
                    column.leads.map(leadCard)
                  ) : (
                    <Typography variant='body2' color='text.secondary' sx={{ py: 5 }}>
                      Sin negocios abiertos
                    </Typography>
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      ))}
      {unassigned.length ? (
        <Stack spacing={3}>
          <Typography variant='h6'>Sin etapa asignada</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {unassigned.map(leadCard)}
          </Box>
        </Stack>
      ) : null}
      <Typography variant='caption' color='text.secondary'>
        Se muestran los últimos 200 negocios abiertos. Los negocios ganados y perdidos se consultan en las listas de
        leads y oportunidades.
      </Typography>
      {editing ? (
        <LeadForm lead={editing} kind={editing.kind} options={options} onClose={() => setEditing(null)} />
      ) : null}
      {stage ? (
        <RecordForm
          title={editingStage ? 'Editar etapa' : 'Nueva etapa'}
          onClose={() => setStage(null)}
          fields={[
            { name: 'name', label: 'Nombre de la etapa', value: editingStage?.name, required: true },
            { name: 'color', label: 'Color', type: 'color', value: editingStage?.color || '#2563eb' },
            {
              name: 'outcome',
              label: 'Resultado al entrar',
              value: editingStage?.outcome || 'OPEN',
              options: [
                { value: 'OPEN', label: 'Mantener abierto' },
                { value: 'WON', label: 'Ganado' },
                { value: 'LOST', label: 'Perdido' }
              ],
              helper: 'Se aplica al guardar o mover un negocio; no modifica los negocios existentes.'
            }
          ]}
          onSave={values =>
            crmRequest(
              `stages${editingStage ? `/${editingStage.id}` : ''}`,
              { ...values, pipelineId },
              editingStage ? 'PATCH' : 'POST'
            )
          }
        />
      ) : null}
      {newPipeline ? (
        <RecordForm
          title='Nuevo pipeline'
          onClose={() => setNewPipeline(false)}
          fields={[{ name: 'name', label: 'Nombre del pipeline', required: true }]}
          onSave={values => crmRequest('pipelines', values)}
        />
      ) : null}
    </Stack>
  )
}
