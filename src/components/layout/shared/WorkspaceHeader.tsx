'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useWorkspaceIdentity } from '@components/crm/WorkspaceIdentity'

const pageNames: Record<string, string> = {
  home: 'Inicio',
  contacts: 'Contactos',
  leads: 'Oportunidades',
  pipeline: 'Pipeline',
  inbox: 'Conversaciones',
  billing: 'Facturación',
  settings: 'Configuración'
}

export default function WorkspaceHeader() {
  const pathname = usePathname()
  const { workspaceName } = useWorkspaceIdentity()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Typography variant='caption' color='text.secondary' noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
        {workspaceName ?? 'Magnus CRM'}
      </Typography>
      <Stack
        component='nav'
        aria-label='Ubicación actual'
        direction='row'
        alignItems='center'
        spacing={1}
        sx={{ minWidth: 0 }}
      >
        <Typography
          component={Link}
          href={segments[0] === 'settings' ? '/settings' : pathname}
          variant='body2'
          sx={{ fontWeight: 600 }}
        >
          {pageNames[segments[0]] ?? 'Magnus CRM'}
        </Typography>
        {segments[1] === 'integrations' ? (
          <>
            <i className='tabler-chevron-right text-sm' aria-hidden='true' />
            <Typography component={Link} href='/settings/integrations' variant='body2'>
              Integraciones
            </Typography>
          </>
        ) : null}
        {segments[2] === 'whatsapp' ? (
          <Typography variant='body2' color='text.secondary' sx={{ display: { xs: 'none', md: 'block' } }}>
            / WhatsApp
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  )
}
