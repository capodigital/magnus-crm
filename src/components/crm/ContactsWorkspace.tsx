'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
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
import ContactForm from './ContactForm'
import EmptyState from './EmptyState'
import { displayName, lifecycleLabels } from '@/lib/crm/contracts'
import type { ContactList } from '@/lib/crm/records-query'

export default function ContactsWorkspace({
  data,
  search,
  lifecycle,
  canWrite
}: {
  data: ContactList
  search: string
  lifecycle: string
  canWrite: boolean
}) {
  const [create, setCreate] = useState(false)
  const router = useRouter()

  return (
    <Stack spacing={4}>
      <PageHeading
        eyebrow='CRM / Relaciones'
        title='Clientes y contactos'
        description='Una visión completa de cada relación, desde el primer contacto hasta el próximo negocio.'
        action={
          canWrite ? (
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setCreate(true)}>
              Nuevo contacto
            </Button>
          ) : undefined
        }
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {[
          ['Contactos encontrados', data.total],
          ['Clientes', data.customers],
          ['Prospectos', data.prospects]
        ].map(([label, count]) => (
          <Card key={label} sx={{ p: 4 }}>
            <Typography color='text.secondary' variant='body2'>
              {label}
            </Typography>
            <Typography variant='h3' sx={{ mt: 1 }}>
              {count}
            </Typography>
          </Card>
        ))}
      </Box>
      <Card>
        <Stack component='form' action='/contacts' direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 3 }}>
          <TextField
            id='contacts-search'
            name='q'
            label='Buscar nombre, empresa, email o teléfono'
            defaultValue={search}
            size='small'
            sx={{ flex: 1 }}
          />
          <TextField
            id='contacts-lifecycle'
            name='lifecycle'
            label='Relación'
            select
            defaultValue={lifecycle}
            size='small'
            sx={{ minWidth: 170 }}
          >
            <MenuItem value=''>Todos</MenuItem>
            {Object.entries(lifecycleLabels).map(([value, label]) => (
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
            <Table sx={{ minWidth: 720 }} aria-label='Clientes y contactos'>
              <TableHead>
                <TableRow>
                  {['Contacto', 'Relación', 'Datos de contacto', 'Etiquetas', 'Actividad'].map(label => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.records.map(contact => (
                  <TableRow
                    key={contact.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                  >
                    <TableCell>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Avatar sx={{ bgcolor: 'primary.lighterOpacity', color: 'primary.main' }}>
                          {displayName(contact).charAt(0)}
                        </Avatar>
                        <Stack>
                          <Typography component={Link} href={`/contacts/${contact.id}`} sx={{ fontWeight: 600 }}>
                            {displayName(contact)}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {contact.company || 'Sin empresa'}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        color={contact.lifecycle === 'CUSTOMER' ? 'success' : 'default'}
                        label={lifecycleLabels[contact.lifecycle as keyof typeof lifecycleLabels]}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{contact.email || 'Sin email'}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {contact.phoneE164 || 'Sin teléfono'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                        {contact.tags.map(tag => (
                          <Chip key={tag} label={tag} size='small' />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{contact._count.leads} negocios</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {contact._count.conversations} chats
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState
            icon='tabler-address-book'
            title={search || lifecycle ? 'No hay contactos con estos filtros' : 'Empieza por tu primer contacto'}
            description='Crea un contacto para reunir su información, conversaciones y seguimiento comercial.'
          />
        )}
      </Card>
      {create ? <ContactForm onClose={() => setCreate(false)} /> : null}
    </Stack>
  )
}
