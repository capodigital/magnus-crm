'use client'

import { useState } from 'react'

import Link from 'next/link'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import PageHeading from './PageHeading'
import EmptyState from './EmptyState'
import LeadForm from './LeadForm'
import type { SalesList, SalesOptions } from '@/lib/crm/records-query'
import { displayName, formatMoney, statusLabels } from '@/lib/crm/contracts'

export default function SalesWorkspace({
  data,
  options,
  kind,
  search,
  status,
  canWrite
}: {
  data: SalesList
  options: SalesOptions
  kind: string
  search: string
  status: string
  canWrite: boolean
}) {
  const [editing, setEditing] = useState<SalesList['records'][number] | 'new' | null>(null)
  const isLead = kind === 'LEAD'

  return (
    <Stack spacing={4}>
      <PageHeading
        eyebrow='CRM / Ventas'
        title={isLead ? 'Leads' : 'Oportunidades'}
        description={
          isLead
            ? 'Califica contactos, asigna responsables y convierte el interés en oportunidades.'
            : 'Gestiona el valor, la etapa y el próximo cierre de cada negocio.'
        }
        action={
          <Stack direction='row' spacing={2}>
            <Button href='/pipeline' variant='outlined'>
              Ver etapas
            </Button>
            {canWrite ? (
              <Button onClick={() => setEditing('new')} variant='contained'>
                {isLead ? 'Nuevo lead' : 'Nueva oportunidad'}
              </Button>
            ) : null}
          </Stack>
        }
      />
      <Card>
        <Stack
          component='form'
          action={isLead ? '/leads' : '/opportunities'}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ p: 3 }}
        >
          <TextField
            id='sales-search'
            name='q'
            size='small'
            label='Buscar negocio o contacto'
            defaultValue={search}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            id='sales-status'
            name='status'
            size='small'
            label='Estado'
            defaultValue={status}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value=''>Todos</MenuItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Button type='submit' variant='outlined'>
            Filtrar
          </Button>
        </Stack>
        {data.records.length ? (
          <TableContainer>
            <Table sx={{ minWidth: 850 }} aria-label={isLead ? 'Leads' : 'Oportunidades'}>
              <TableHead>
                <TableRow>
                  {['Negocio / Contacto', 'Etapa', 'Importe', 'Responsable', 'Estado', 'Acciones'].map(label => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.records.map(lead => (
                  <TableRow key={lead.id} hover>
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography fontWeight={600}>{lead.title}</Typography>
                        <Typography
                          component={Link}
                          href={`/contacts/${lead.contactId}`}
                          variant='body2'
                          color='primary'
                        >
                          {displayName(lead.contact)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{lead.stage?.name || 'Sin etapa'}</TableCell>
                    <TableCell>{formatMoney(lead.valueCents, lead.currency)}</TableCell>
                    <TableCell>{lead.ownerUser?.name || 'Sin asignar'}</TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        variant='outlined'
                        color={lead.status === 'WON' ? 'success' : lead.status === 'LOST' ? 'error' : 'default'}
                        label={statusLabels[lead.status]}
                      />
                    </TableCell>
                    <TableCell>
                      {canWrite ? (
                        <Button size='small' onClick={() => setEditing(lead)}>
                          Gestionar
                        </Button>
                      ) : (
                        <Button href={`/contacts/${lead.contactId}`} size='small'>
                          Ver contacto
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState
            icon='tabler-target-arrow'
            title={isLead ? 'Sin leads en esta vista' : 'Sin oportunidades en esta vista'}
            description='Crea un negocio asociado a un contacto o ajusta los filtros.'
          />
        )}
      </Card>
      {editing ? (
        <LeadForm
          lead={editing === 'new' ? undefined : editing}
          kind={kind}
          options={options}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </Stack>
  )
}
