'use client'

import { useRef, useState } from 'react'

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
  canWrite,
  initialCreate = ''
}: {
  data: ContactList
  search: string
  lifecycle: string
  canWrite: boolean
  initialCreate?: string
}) {
  const [create, setCreate] = useState(canWrite ? initialCreate : '')
  const router = useRouter()
  const created = useRef(false)

  return (
    <Stack spacing={4}>
      <PageHeading
        eyebrow='CRM / Relaciones'
        title='Clientes y contactos'
        description='Clientes, prospectos y su historial en un mismo lugar.'
        action={
          canWrite ? (
            <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap'>
              <Button variant='outlined' onClick={() => setCreate('PROSPECT')}>
                Nuevo contacto
              </Button>
              <Button
                variant='contained'
                startIcon={<i className='tabler-user-plus' />}
                onClick={() => setCreate('CUSTOMER')}
              >
                Nuevo cliente
              </Button>
            </Stack>
          ) : undefined
        }
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: { xs: 2, md: 3 } }}>
        {[
          ['En esta vista', data.total],
          ['Clientes', data.customers],
          ['Prospectos', data.prospects]
        ].map(([label, count]) => (
          <Card key={label} sx={{ p: { xs: 2, md: 4 } }}>
            <Typography color='text.secondary' variant='body2' sx={{ fontSize: { xs: 12, md: 14 } }}>
              {label}
            </Typography>
            <Typography variant='h3' sx={{ mt: 1 }}>
              {count}
            </Typography>
          </Card>
        ))}
      </Box>
      <Card>
        <Typography variant='body2' color='text.secondary' sx={{ px: 3, pt: 3, display: { xs: 'none', md: 'block' } }}>
          Toca un contacto para abrir su ficha o entra directamente a sus chats, propuestas e interacciones.
        </Typography>
        <Stack component='form' action='/contacts' direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 3 }}>
          <TextField
            id='contacts-search'
            name='q'
            label='Buscar contactos'
            placeholder='Nombre, empresa, email o teléfono'
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
          <>
            <Stack spacing={2} sx={{ p: 3, display: { xs: 'flex', md: 'none' } }}>
              {data.records.map(contact => (
                <Card key={contact.id} variant='outlined' sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Typography component={Link} href={`/contacts/${contact.id}`} variant='h6' color='primary'>
                      {displayName(contact)} ↗
                    </Typography>
                    <Typography variant='body2'>
                      {contact.company || contact.email || contact.phoneE164 || 'Sin empresa'}
                    </Typography>
                    <Chip
                      sx={{ alignSelf: 'flex-start' }}
                      size='small'
                      label={lifecycleLabels[contact.lifecycle as keyof typeof lifecycleLabels]}
                    />
                    <ContactLinks id={contact.id} />
                  </Stack>
                </Card>
              ))}
            </Stack>
            <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
              <Table sx={{ minWidth: 720 }} aria-label='Clientes y contactos'>
                <TableHead>
                  <TableRow>
                    {['Contacto', 'Relación', 'Datos de contacto', 'Etiquetas', 'Ficha'].map(label => (
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
                        <ContactLinks id={contact.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <EmptyState
            icon='tabler-address-book'
            title={search || lifecycle ? 'No hay contactos con estos filtros' : 'Empieza por tu primer contacto'}
            description='Crea un contacto para reunir su información, conversaciones y seguimiento comercial.'
          />
        )}
      </Card>
      {create ? (
        <ContactForm
          initialLifecycle={create}
          onClose={() => {
            setCreate('')
            if (initialCreate && !created.current) router.replace('/contacts')
          }}
          onCreated={contact => {
            created.current = true
            setCreate('')
            router.push(`/contacts/${contact.id}`)
          }}
        />
      ) : null}
    </Stack>
  )
}

function ContactLinks({ id }: { id: string }) {
  return (
    <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' onClick={event => event.stopPropagation()}>
      {[
        ['info', 'Ficha'],
        ['chats', 'Chats'],
        ['proposals', 'Propuestas IA'],
        ['timeline', 'Interacciones']
      ].map(([tab, label]) => (
        <Button component={Link} key={tab} href={`/contacts/${id}?tab=${tab}`} size='small'>
          {label}
        </Button>
      ))}
    </Stack>
  )
}
