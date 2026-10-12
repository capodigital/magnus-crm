import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import EmptyState from './EmptyState'

import type { WorkspaceLead } from '@/lib/crm/workspace-query'

export const leadStatusLabels: Record<string, string> = {
  OPEN: 'Abiertas',
  WON: 'Ganadas',
  LOST: 'Perdidas',
  ARCHIVED: 'Archivadas'
}
const statusColors = { OPEN: 'info', WON: 'success', LOST: 'error', ARCHIVED: 'default' } as const
const statusLabels = { OPEN: 'Abierta', WON: 'Ganada', LOST: 'Perdida', ARCHIVED: 'Archivada' }

const sourceLabels: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  MANUAL: 'Manual',
  IMPORT: 'Importación',
  API: 'API'
}

export default function LeadsTable({ leads }: { leads: WorkspaceLead[] }) {
  if (!leads.length)
    return (
      <EmptyState
        icon='tabler-target-arrow'
        title='Aún no hay oportunidades'
        description='Las oportunidades de tu equipo aparecerán aquí con su contacto, responsable y etapa comercial.'
      />
    )

  return (
    <TableContainer>
      <Table aria-label='Oportunidades comerciales' sx={{ minWidth: 680 }}>
        <TableHead>
          <TableRow>
            {['Oportunidad / Contacto', 'Etapa', 'Responsable', 'Origen', 'Estado'].map(label => (
              <TableCell key={label}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map(lead => (
            <TableRow key={lead.id} hover>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {lead.title ?? lead.contact.fullName ?? lead.contact.firstName ?? 'Sin título'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {lead.contact.fullName ?? lead.contact.email ?? lead.contact.phoneE164 ?? 'Contacto sin nombre'}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>{lead.stage?.name ?? 'Sin etapa'}</TableCell>
              <TableCell>{lead.ownerUser?.name ?? 'Sin asignar'}</TableCell>
              <TableCell>{sourceLabels[lead.sourceChannel] ?? lead.sourceChannel}</TableCell>
              <TableCell>
                <Chip
                  size='small'
                  variant='outlined'
                  color={statusColors[lead.status]}
                  label={statusLabels[lead.status]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
