import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <Stack alignItems='center' spacing={2} sx={{ px: 4, py: 10, textAlign: 'center' }}>
      <Stack
        alignItems='center'
        justifyContent='center'
        sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'primary.lighterOpacity', color: 'primary.main' }}
      >
        <i className={icon} aria-hidden='true' />
      </Stack>
      <Typography variant='h6'>{title}</Typography>
      <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
    </Stack>
  )
}
