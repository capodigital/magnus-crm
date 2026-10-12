'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

const items = [
  { label: 'General', href: '/settings', icon: 'tabler-building' },
  { label: 'Integraciones', href: '/settings/integrations', icon: 'tabler-plug-connected' },
  { label: 'Cuenta y privacidad', href: '/settings/data-deletion', icon: 'tabler-shield-lock' }
]

export default function SettingsNavigation() {
  const pathname = usePathname()

  return (
    <Box
      component='nav'
      aria-label='Configuración'
      sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      {items.map(item => {
        const active = item.href === '/settings' ? pathname === item.href : pathname.startsWith(item.href)

        return (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            variant='text'
            color={active ? 'primary' : 'secondary'}
            startIcon={<i className={item.icon} aria-hidden='true' />}
            sx={{ bgcolor: active ? 'primary.lighterOpacity' : 'transparent' }}
          >
            {item.label}
          </Button>
        )
      })}
    </Box>
  )
}
