'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import Link from '@/components/Link'
import Logo from '@/components/layout/shared/Logo'

const artwork = {
  login: {
    image: '/images/illustrations/auth/magnus-login.webp',
    eyebrow: 'TU NEGOCIO, EN CONEXIÓN',
    title: 'Las buenas relaciones hacen crecer tu negocio.',
    description: 'Conecta tus conversaciones, clientes y oportunidades en un mismo lugar.'
  },
  register: {
    image: '/images/illustrations/auth/magnus-register.webp',
    eyebrow: 'UN NUEVO COMIENZO',
    title: 'Un espacio para todo lo que viene.',
    description: 'Construye relaciones, organiza tu equipo y dale seguimiento a cada oportunidad.'
  }
} as const

// Mobile keeps the form in focus and does not download the desktop illustration.
const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='

export default function AuthPageLayout({ variant, children }: { variant: keyof typeof artwork; children: ReactNode }) {
  const content = artwork[variant]

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: { xs: 'block', md: 'grid' },
        gridTemplateColumns: { md: 'minmax(0, 1fr) 480px', lg: 'minmax(0, 1fr) 520px' },
        bgcolor: 'background.paper'
      }}
    >
      <Box
        component='aside'
        aria-label='Magnus CRM'
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          gap: 4,
          position: 'sticky',
          top: 0,
          height: '100dvh',
          minHeight: 560,
          px: { md: 6, lg: 10, xl: 14 },
          py: { md: 6, lg: 8 },
          bgcolor: theme => (theme.palette.mode === 'dark' ? '#132F30' : '#EDF4F0'),
          borderInlineEnd: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Link href='/' aria-label='Magnus CRM, inicio' style={{ alignSelf: 'flex-start' }}>
          <Logo />
        </Link>
        <Box
          component='picture'
          sx={{ flex: 1, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <source media='(min-width: 900px)' srcSet={content.image} />
          <Box
            component='img'
            src={transparentPixel}
            alt=''
            aria-hidden='true'
            width={1200}
            height={1200}
            sx={{ width: '100%', height: '100%', maxHeight: 'min(53vh, 560px)', objectFit: 'contain' }}
          />
        </Box>
        <Stack spacing={2} sx={{ maxWidth: 530, pb: 1 }}>
          <Typography
            variant='overline'
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.16em', fontSize: 11 }}
          >
            {content.eyebrow}
          </Typography>
          <Typography
            component='p'
            sx={{
              fontSize: { md: 28, lg: 36, xl: 42 },
              lineHeight: 1.16,
              fontWeight: 600,
              letterSpacing: '-0.035em',
              textWrap: 'balance'
            }}
          >
            {content.title}
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 400, lineHeight: 1.65, fontSize: 14 }}>
            {content.description}
          </Typography>
        </Stack>
      </Box>
      <Box
        component='main'
        sx={{
          minWidth: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 6, sm: 10, md: 8, lg: 10 },
          py: { xs: 7, sm: 10 }
        }}
      >
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 8, width: '100%', maxWidth: 420, mx: 'auto' }}>
          <Link href='/' aria-label='Magnus CRM, inicio'>
            <Logo />
          </Link>
        </Box>
        <Stack spacing={5} sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
          {children}
        </Stack>
      </Box>
    </Box>
  )
}
