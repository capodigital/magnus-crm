import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import EmptyState from '@components/crm/EmptyState'
import PageHeading from '@components/crm/PageHeading'

import { requireTenantAccess } from '@/lib/app-context'
import { getWorkspacePipeline } from '@/lib/crm/workspace-query'

export default async function PipelinePage() {
  const context = await requireTenantAccess()
  const workspace = context.tenant ?? context.memberships[0]?.tenant
  const { pipelines, leads } = workspace ? await getWorkspacePipeline(workspace.id) : { pipelines: [], leads: [] }

  const unassigned = leads.filter(
    lead => !lead.stageId || !pipelines.some(pipeline => pipeline.stages.some(stage => stage.id === lead.stageId))
  )

  const boards = pipelines.map(pipeline => ({
    id: pipeline.id,
    name: pipeline.name,
    columns: pipeline.stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      leads: leads.filter(lead => lead.stageId === stage.id)
    }))
  }))

  if (unassigned.length)
    boards.push({
      id: 'unassigned',
      name: 'Sin etapa asignada',
      columns: [{ id: 'unassigned', name: 'Por organizar', leads: unassigned }]
    })

  return (
    <Stack spacing={5}>
      <PageHeading
        eyebrow='CRM'
        title='Pipeline comercial'
        description='Visualiza las oportunidades abiertas por etapa e identifica dónde se concentra el trabajo de tu equipo.'
        action={
          <Button href='/leads' variant='outlined'>
            Vista de lista
          </Button>
        }
      />
      {!boards.length ? (
        <Card>
          <EmptyState
            icon='tabler-layout-kanban'
            title='Aún no hay un pipeline'
            description='Las etapas comerciales de tu espacio de trabajo aparecerán aquí junto con sus oportunidades abiertas.'
          />
        </Card>
      ) : (
        boards.map(board => (
          <Stack key={board.id} spacing={3} sx={{ minWidth: 0 }}>
            <Typography variant='h6'>{board.name}</Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: `repeat(${Math.min(Math.max(board.columns.length, 1), 4)}, minmax(0, 1fr))`
                }
              }}
            >
              {board.columns.map(column => (
                <Box
                  key={column.id}
                  sx={{
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 3,
                    minWidth: 0
                  }}
                >
                  <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between' sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                      {column.name}
                    </Typography>
                    <Chip size='small' label={column.leads.length} variant='outlined' />
                  </Stack>
                  <Stack spacing={2}>
                    {column.leads.length ? (
                      column.leads.map(lead => (
                        <Card key={lead.id}>
                          <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2}>
                              <Typography variant='subtitle2' sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                                {lead.title ?? lead.contact.fullName ?? 'Oportunidad sin título'}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {lead.contact.fullName ??
                                  lead.contact.email ??
                                  lead.contact.phoneE164 ??
                                  'Contacto sin nombre'}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {lead.ownerUser?.name ?? 'Sin responsable'}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Typography variant='body2' color='text.secondary' sx={{ py: 6, textAlign: 'center' }}>
                        Sin oportunidades en esta etapa
                      </Typography>
                    )}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Stack>
        ))
      )}
      <Typography variant='caption' color='text.secondary'>
        Vista de consulta de las últimas 200 oportunidades abiertas. Para revisar todos los registros, utiliza la vista
        de lista.
      </Typography>
    </Stack>
  )
}
