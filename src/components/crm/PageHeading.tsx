import type { ReactNode } from 'react'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type Props = { eyebrow?: string; title: string; description: string; action?: ReactNode }

export default function PageHeading({ eyebrow, title, description, action }: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' spacing={3}>
      <Stack spacing={1} sx={{ minWidth: 0 }}>
        {eyebrow ? (
          <Typography variant='overline' color='primary.main' sx={{ fontWeight: 600 }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography component='h1' variant='h4' sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
          {title}
        </Typography>
        <Typography color='text.secondary' sx={{ maxWidth: 720 }}>
          {description}
        </Typography>
      </Stack>
      {action ? <Stack sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, flexShrink: 0 }}>{action}</Stack> : null}
    </Stack>
  )
}
