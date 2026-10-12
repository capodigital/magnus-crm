'use client'

import { useState } from 'react'

import { signOut } from 'next-auth/react'

import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useWorkspaceIdentity } from '@components/crm/WorkspaceIdentity'

export default function UserDropdown() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const { userName, userEmail, userImage } = useWorkspaceIdentity()
  const name = userName ?? userEmail ?? 'Mi cuenta'

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <IconButton
        aria-label='Abrir menú de cuenta'
        aria-haspopup='menu'
        aria-expanded={Boolean(anchor)}
        onClick={event => setAnchor(event.currentTarget)}
      >
        <Avatar
          alt={name}
          src={userImage ?? undefined}
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'primary.lighterOpacity',
            color: 'primary.main',
            fontSize: 13,
            fontWeight: 600
          }}
        >
          {initials}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Stack spacing={0.5} sx={{ px: 4, py: 2, maxWidth: 280 }}>
          <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{name}</Typography>
          <Typography variant='caption' color='text.secondary' sx={{ overflowWrap: 'anywhere' }}>
            {userEmail}
          </Typography>
        </Stack>
        <Divider />
        <MenuItem component='a' href='/settings' onClick={() => setAnchor(null)}>
          Configuración
        </MenuItem>
        <MenuItem component='a' href='/settings/integrations' onClick={() => setAnchor(null)}>
          Integraciones
        </MenuItem>
        <MenuItem component='a' href='/settings/data-deletion' onClick={() => setAnchor(null)}>
          Cuenta y privacidad
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => void signOut({ callbackUrl: '/login' })} sx={{ color: 'error.main' }}>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  )
}
