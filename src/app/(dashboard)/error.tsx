'use client'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <Stack spacing={3}><Alert severity='error'>No pudimos cargar esta sección. Comprueba la conexión y vuelve a intentarlo.</Alert><Button variant='outlined' onClick={reset} sx={{ alignSelf: 'flex-start' }}>Reintentar</Button></Stack>
}
