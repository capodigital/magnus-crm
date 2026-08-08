import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

const InboxLoading = () => {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Skeleton variant='text' width={180} height={24} />
        <Skeleton variant='text' width='min(680px, 80%)' height={52} />
        <Skeleton variant='text' width='min(560px, 70%)' height={28} />
      </Stack>
      <Card variant='outlined' sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(300px, 0.8fr) minmax(0, 1.5fr)' },
            minHeight: { xs: 520, lg: 650 }
          }}
        >
          <Stack spacing={2} sx={{ p: { xs: 3, md: 4 }, borderInlineEnd: { lg: '1px solid' }, borderColor: 'divider' }}>
            <Skeleton variant='text' width={180} height={32} />
            <Skeleton variant='rounded' height={42} />
            <Skeleton variant='rounded' height={34} />
            <Stack spacing={1.5} sx={{ pt: 2 }}>
              {[1, 2, 3, 4].map(item => (
                <Stack key={item} direction='row' spacing={1.5} alignItems='center'>
                  <Skeleton variant='circular' width={40} height={40} />
                  <Stack sx={{ flex: 1 }}>
                    <Skeleton variant='text' width='65%' />
                    <Skeleton variant='text' width='90%' />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Stack spacing={2} sx={{ p: { xs: 3, md: 4 } }}>
            <Skeleton variant='rounded' height={58} />
            <Skeleton variant='rounded' width='72%' height={74} sx={{ mt: 8 }} />
            <Skeleton variant='rounded' width='62%' height={74} sx={{ ml: 'auto' }} />
            <Skeleton variant='rounded' width='54%' height={74} />
          </Stack>
        </Box>
      </Card>
    </Stack>
  )
}

export default InboxLoading
