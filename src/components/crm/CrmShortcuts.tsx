'use client'

import Link from 'next/link'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const shortcuts = [
  [
    '/contacts?create=customer',
    'Crear cliente',
    'Alta manual y ficha con chats, propuestas e historial.',
    'tabler-user-plus'
  ],
  ['/leads?create=1', 'Crear lead', 'Registra un interés comercial y asígnale una etapa.', 'tabler-target-arrow'],
  ['/activities', 'Ver interacciones', 'Llamadas, emails, reuniones, tareas y recordatorios.', 'tabler-timeline'],
  ['/campaigns', 'Gestionar campañas', 'Segmenta destinatarios, redacta y programa emails.', 'tabler-speakerphone']
]

export default function CrmShortcuts() {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' } }}>
      {shortcuts.map(([href, title, description, icon]) => (
        <Card key={href} variant='outlined'>
          <CardActionArea component={Link} href={href} sx={{ p: 3, height: '100%' }}>
            <Stack spacing={1.5}>
              <Stack direction='row' spacing={2} alignItems='center'>
                <i className={`${icon} text-primary`} aria-hidden='true' />
                <Typography variant='subtitle1' fontWeight={600}>
                  {title}
                </Typography>
                <i className='tabler-arrow-up-right' aria-hidden='true' />
              </Stack>
              <Typography variant='body2' color='text.secondary'>
                {description}
              </Typography>
            </Stack>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  )
}
