import Link from 'next/link'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type Action = {
  label: string
  href: string
  variant?: 'contained' | 'outlined'
}

type SectionPageProps = {
  eyebrow: string
  title: string
  description: string
  status: string
  actions: Action[]
  bullets: string[]
}

const SectionPage = ({ eyebrow, title, description, status, actions, bullets }: SectionPageProps) => {
  return (
    <Card variant='outlined'>
      <CardContent sx={{ p: { xs: 4, md: 5 } }}>
        <Stack spacing={3}>
          <Chip label={eyebrow} sx={{ alignSelf: 'flex-start', fontWeight: 600 }} />
          <Stack spacing={1.25} sx={{ maxWidth: 760 }}>
            <Typography variant='h4' component='h1' sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {description}
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {actions.map(action => (
              <Button
                key={action.label}
                component={Link}
                href={action.href}
                variant={action.variant ?? 'contained'}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
          <Divider />
          <Stack spacing={2}>
            <Typography variant='overline' color='text.secondary' sx={{ letterSpacing: 1.2 }}>
              {status}
            </Typography>
            <Stack component='ul' spacing={1.25} sx={{ pl: 2.5, m: 0 }}>
              {bullets.map(bullet => (
                <Typography key={bullet} component='li' variant='body2' color='text.secondary'>
                  {bullet}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default SectionPage
