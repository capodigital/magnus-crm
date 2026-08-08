'use client'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type InboxErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const InboxError = ({ reset }: InboxErrorProps) => {
  return (
    <Card variant='outlined'>
      <CardContent sx={{ p: { xs: 4, md: 6 } }}>
        <Stack spacing={2} alignItems='flex-start'>
          <Alert severity='error'>No pudimos cargar las conversaciones ahora mismo.</Alert>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>
            La bandeja necesita volver a intentarlo
          </Typography>
          <Typography color='text.secondary'>
            Comprueba la conexion de la aplicacion y vuelve a cargar el inbox. Tus mensajes no se eliminan por este error.
          </Typography>
          <Button variant='contained' onClick={reset}>
            Intentar de nuevo
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default InboxError
