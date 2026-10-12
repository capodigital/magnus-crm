import { redirect } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import EmptyState from '@components/crm/EmptyState'
import PageHeading from '@components/crm/PageHeading'
import RecordsPagination, { parsePage } from '@components/crm/RecordsPagination'

import { requireTenantAccess } from '@/lib/app-context'
import { getWorkspaceContacts } from '@/lib/crm/workspace-query'

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const context = await requireTenantAccess()
  const workspace = context.tenant ?? context.memberships[0]?.tenant
  const page = parsePage((await searchParams).page)
  const contacts = workspace ? await getWorkspaceContacts(workspace.id, page) : { records: [], total: 0 }

  if (page > Math.max(1, Math.ceil(contacts.total / 25))) redirect('/contacts')

  return (
    <Stack spacing={5}>
      <PageHeading
        eyebrow='CRM'
        title='Contactos'
        description='Una vista compartida de tus clientes y de las relaciones que construye tu equipo.'
      />
      <Card>
        {contacts.records.length ? (
          <TableContainer>
            <Table aria-label='Contactos' sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  {['Contacto', 'Correo electrónico', 'Teléfono', 'Etiquetas', 'Oportunidades'].map(label => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.records.map(contact => {
                  const name =
                    contact.fullName ??
                    ([contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Sin nombre')

                  return (
                    <TableRow key={contact.id} hover>
                      <TableCell>
                        <Stack direction='row' spacing={2} alignItems='center'>
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: 14,
                              bgcolor: 'primary.lighterOpacity',
                              color: 'primary.main'
                            }}
                          >
                            {name.slice(0, 1).toUpperCase()}
                          </Avatar>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{contact.email ?? '—'}</TableCell>
                      <TableCell>{contact.phoneE164 ?? '—'}</TableCell>
                      <TableCell>
                        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                          {contact.tags.length
                            ? contact.tags.map(tag => <Chip key={tag} label={tag} size='small' variant='outlined' />)
                            : '—'}
                        </Stack>
                      </TableCell>
                      <TableCell>{contact._count.leads}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState
            icon='tabler-address-book'
            title='Tu base de contactos empieza aquí'
            description='Cuando tengas clientes registrados, podrás consultar aquí sus datos y oportunidades asociadas.'
          />
        )}
        <RecordsPagination page={page} total={contacts.total} href='/contacts' />
      </Card>
    </Stack>
  )
}
