import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export default function WorkspaceLoading() {
  return <Stack spacing={3} role='status' aria-label='Cargando sección'><Skeleton width='45%' height={48} /><Skeleton width='75%' height={24} /><Skeleton variant='rounded' height={300} /></Stack>
}
