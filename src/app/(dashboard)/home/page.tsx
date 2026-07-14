import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const metricCards = [
  { label: 'New leads today', value: '14', detail: '+3 vs yesterday' },
  { label: 'Open conversations', value: '28', detail: '9 waiting for reply' },
  { label: 'Response rate', value: '86%', detail: 'Last 7 days' },
  { label: 'Meta spend', value: '$128.40', detail: 'Estimated month-to-date' }
]

const nextActions = [
  'Wire tenant resolution from host and session once the CRM shell is stable.',
  'Add NextAuth with email/password plus Google sign-in as the first auth layer.',
  'Prepare WhatsApp Embedded Signup screens and required environment keys.',
  'Replace the remaining template pages with CRM flows in the next goal.'
]

const operationalNotes = [
  'Multi-tenant SaaS from day one.',
  'Core CRM first; white-label later.',
  'WhatsApp onboarding planned through Embedded Signup.',
  'Project-local skills and journal files already enabled.'
]

export default function Page() {
  return (
    <Stack spacing={4}>
      <Card
        sx={{
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.96) 50%, rgba(14, 116, 144, 0.92) 100%)',
          color: 'common.white'
        }}
      >
        <CardContent sx={{ p: { xs: 4, md: 6 } }}>
          <Stack spacing={3}>
            <Chip
              label='Multi-tenant CRM foundation'
              sx={{
                alignSelf: 'flex-start',
                color: 'common.white',
                bgcolor: 'rgba(255, 255, 255, 0.16)',
                fontWeight: 600
              }}
            />
            <Stack spacing={1.5} sx={{ maxWidth: 760 }}>
              <Typography variant='h3' component='h1' sx={{ fontWeight: 800, lineHeight: 1.05 }}>
                Magnus CRM workspace
              </Typography>
              <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.82)', maxWidth: 680 }}>
                This shell is now oriented around lead capture, WhatsApp conversations, sales pipeline work, and
                transparent billing. The template is still here underneath, but the product shape is starting to show.
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant='contained' color='secondary' href='/inbox'>
                Open inbox
              </Button>
              <Button
                variant='outlined'
                href='/settings'
                sx={{ color: 'common.white', borderColor: 'rgba(255, 255, 255, 0.4)' }}
              >
                Review settings
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }
        }}
      >
        {metricCards.map(metric => (
          <Card key={metric.label} variant='outlined' sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, minHeight: 132 }}>
              <Typography variant='overline' color='text.secondary'>
                {metric.label}
              </Typography>
              <Typography variant='h4' sx={{ fontWeight: 800 }}>
                {metric.value}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {metric.detail}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(0, 0.9fr)' }
        }}
      >
        <Card variant='outlined'>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              <Stack spacing={0.75}>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  What happens next
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  The next implementation goal is to convert this shell into tenant-aware CRM surfaces and wire auth.
                </Typography>
              </Stack>
              <Divider />
              <Stack component='ul' spacing={1.5} sx={{ pl: 2.5, m: 0 }}>
                {nextActions.map(action => (
                  <Typography key={action} component='li' variant='body2' color='text.secondary'>
                    {action}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant='outlined'>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              <Stack spacing={0.75}>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  Project defaults
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  These decisions are now the working baseline until you change them.
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={1.25}>
                {operationalNotes.map(note => (
                  <Chip key={note} label={note} variant='outlined' sx={{ justifyContent: 'flex-start' }} />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  )
}
