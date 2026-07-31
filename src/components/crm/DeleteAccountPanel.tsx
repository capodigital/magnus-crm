'use client'

import { useState, type FormEvent } from 'react'

import { signOut } from 'next-auth/react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'

const confirmationWord = 'ELIMINAR'

const DeleteAccountPanel = () => {
  const [confirmation, setConfirmation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (confirmation !== confirmationWord) {
      setErrorMessage(`Escribe ${confirmationWord} para continuar.`)
      
return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const response = await fetch('/api/account/delete', {
      method: 'DELETE'
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null

      setErrorMessage(payload?.error ?? 'No pudimos eliminar la cuenta ahora mismo.')
      setIsSubmitting(false)
      
return
    }

    await signOut({
      callbackUrl: '/'
    })
  }

  return (
    <Card variant='outlined'>
      <CardContent sx={{ p: { xs: 4, md: 5 } }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant='h5' component='h2' sx={{ fontWeight: 800 }}>
              Eliminar mi cuenta
            </Typography>
            <Typography color='text.secondary'>
              Esta accion elimina tu acceso al CRM y borra tu usuario de la plataforma. Si tu workspace depende de un
              administrador, puede que parte de la informacion comercial permanezca asociada al tenant.
            </Typography>
          </Stack>
          <Box
            sx={{
              borderRadius: 3,
              border: theme => `1px dashed ${theme.palette.error.main}`,
              bgcolor: theme => theme.palette.error.lightOpacity,
              p: 3
            }}
          >
            <Stack spacing={1}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                Antes de continuar
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Cierra cualquier sesion compartida y exporta la informacion que necesites conservar. Esta accion no se puede
                deshacer.
              </Typography>
            </Stack>
          </Box>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <CustomTextField
              fullWidth
              label='Confirmacion'
              placeholder={`Escribe ${confirmationWord}`}
              value={confirmation}
              onChange={event => setConfirmation(event.target.value.trim().toUpperCase())}
            />
            {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
            <div className='flex flex-wrap gap-3'>
              <Button variant='contained' color='error' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Eliminando cuenta...' : 'Eliminar mi cuenta'}
              </Button>
              <Button variant='outlined' href='/settings'>
                Volver a configuracion
              </Button>
            </div>
          </form>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default DeleteAccountPanel
