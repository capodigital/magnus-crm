import Link from 'next/link'

import Box from '@mui/material/Box'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import Button from '@components/crm/LinkButton'

import PageHeading from './PageHeading'
import LeadsTable, { leadStatusLabels } from './LeadsTable'

import type { WorkspaceSummary } from '@/lib/crm/workspace-query'

type Props = { workspaceName: string | null; summary: WorkspaceSummary | null }

const statusColors: Record<string, string> = {
  OPEN: 'primary.main',
  WON: 'success.main',
  LOST: 'error.main',
  ARCHIVED: 'text.disabled'
}

export default function HomeDashboard({ workspaceName, summary }: Props) {
  const metrics = [
    {
      label: 'Contactos',
      value: summary?.contacts ?? 0,
      description: 'Tu base de clientes',
      icon: 'tabler-address-book',
      href: '/contacts'
    },
    {
      label: 'Oportunidades abiertas',
      value: summary?.opportunities ?? 0,
      description: 'Negocios en seguimiento',
      icon: 'tabler-target-arrow',
      href: '/leads'
    },
    {
      label: 'Conversaciones activas',
      value: summary?.conversations ?? 0,
      description: 'Abiertas y pendientes',
      icon: 'tabler-messages',
      href: '/inbox'
    },
    {
      label: 'Oportunidades ganadas',
      value: summary?.won ?? 0,
      description: 'Resultados de tu equipo',
      icon: 'tabler-trophy',
      href: '/pipeline'
    }
  ]

  const totalLeads = summary?.leadStatuses.reduce((total, group) => total + group._count._all, 0) ?? 0

  return (
    <Stack spacing={5}>
      <PageHeading
        eyebrow={workspaceName ?? 'Tu espacio comercial'}
        title='Resumen de tu negocio'
        description='Tus clientes, oportunidades y conversaciones, en un mismo lugar.'
        action={
          <Button
            href='/pipeline'
            variant='contained'
            startIcon={<i className='tabler-layout-kanban' aria-hidden='true' />}
          >
            Ver pipeline
          </Button>
        }
      />
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }
        }}
      >
        {metrics.map(metric => (
          <Card key={metric.label}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={3}>
                <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
                  <Typography variant='body2' color='text.secondary'>
                    {metric.label}
                  </Typography>
                  <Box sx={{ color: 'primary.main', display: { xs: 'none', sm: 'block' } }}>
                    <i className={metric.icon} aria-hidden='true' />
                  </Box>
                </Stack>
                <Typography variant='h3' component='p' sx={{ fontWeight: 700 }}>
                  {metric.value.toLocaleString('es-419')}
                </Typography>
                <Link href={metric.href}>
                  <Typography variant='caption' color='text.secondary'>
                    {metric.description} ↗
                  </Typography>
                </Link>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.7fr) minmax(0, 1fr)' },
          alignItems: 'start'
        }}
      >
        <Card sx={{ minWidth: 0 }}>
          <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2} sx={{ p: 4 }}>
            <Stack spacing={0.75}>
              <Typography variant='h6' component='h2'>
                Oportunidades recientes
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Los últimos movimientos de tu equipo.
              </Typography>
            </Stack>
            <Button href='/leads' size='small' sx={{ flexShrink: 0 }}>
              Ver todas
            </Button>
          </Stack>
          <Divider />
          <LeadsTable leads={summary?.recentLeads ?? []} />
        </Card>
        <Stack spacing={4}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                <Stack spacing={0.75}>
                  <Typography variant='h6' component='h2'>
                    Estado comercial
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {totalLeads} oportunidades en total
                  </Typography>
                </Stack>
                <Box sx={{ display: 'flex', height: 8, overflow: 'hidden', borderRadius: 1, bgcolor: 'action.hover' }}>
                  {summary?.leadStatuses.map(group => (
                    <Box
                      key={group.status}
                      sx={{
                        width: `${totalLeads ? (group._count._all / totalLeads) * 100 : 0}%`,
                        bgcolor: statusColors[group.status]
                      }}
                    />
                  ))}
                </Box>
                <Stack spacing={2}>
                  {Object.entries(leadStatusLabels).map(([status, label]) => (
                    <Stack key={status} direction='row' alignItems='center' spacing={2}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: statusColors[status] }} />
                      <Typography variant='body2' sx={{ flex: 1 }} color='text.secondary'>
                        {label}
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {summary?.leadStatuses.find(group => group.status === status)?._count._all ?? 0}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: 'primary.lighterOpacity', borderColor: 'transparent' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2.5}>
                <i className='tabler-plug-connected text-primary' aria-hidden='true' />
                <Typography variant='h6' component='h2'>
                  Un CRM conectado a tu equipo
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Añade tus herramientas desde Configuración y reúne los canales de tus clientes en este espacio.
                </Typography>
                <Button
                  href='/settings/integrations'
                  size='small'
                  endIcon={<i className='tabler-arrow-right' aria-hidden='true' />}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Explorar integraciones
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  )
}
