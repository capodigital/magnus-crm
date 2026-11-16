'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

const sections = [
  ['/contacts', 'Clientes', 'tabler-address-book'],
  ['/leads', 'Leads', 'tabler-user-search'],
  ['/opportunities', 'Oportunidades', 'tabler-target-arrow'],
  ['/pipeline', 'Etapas', 'tabler-layout-kanban'],
  ['/activities', 'Interacciones', 'tabler-timeline'],
  ['/inbox', 'Chats', 'tabler-messages'],
  ['/campaigns', 'Campañas', 'tabler-speakerphone'],
  ['/automations', 'Automatizaciones', 'tabler-bolt']
]

export default function CrmNavigation() {
  const pathname = usePathname()

  if (pathname !== '/home' && !sections.some(([href]) => pathname.startsWith(href))) return null

  return (
    <Box component='nav' aria-label='Secciones del CRM' sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
      {sections.map(([href, label, icon]) => {
        const active = pathname.startsWith(href)

        return (
          <Button
            key={href}
            component={Link}
            href={href}
            size='small'
            variant={active ? 'contained' : 'outlined'}
            color={active ? 'primary' : 'secondary'}
            aria-current={active ? 'page' : undefined}
            startIcon={<i className={icon} aria-hidden='true' />}
          >
            {label}
          </Button>
        )
      })}
    </Box>
  )
}
