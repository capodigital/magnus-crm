'use client'

import { useState, type FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import { signOut } from 'next-auth/react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export default function GoogleWorkspaceForm({ email, callbackUrl }: { email: string; callbackUrl: string }) {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError('')

    try {
      const response = await fetch('/api/register/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, acceptedTerms })
      })

      const payload = await response.json()

      if (!response.ok) throw new Error(payload.error || 'No pudimos crear tu espacio. Inténtalo de nuevo.')
      router.replace(callbackUrl)
      router.refresh()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No pudimos completar el registro.')
      setPending(false)
    }
  }

  return (
    <Card sx={{ width: '100%', maxWidth: 480, p: { xs: 4, sm: 6 } }}>
      <Stack component='form' spacing={3} onSubmit={submit}>
        <Typography variant='h4' component='h1'>
          Crea tu espacio de trabajo
        </Typography>
        <Typography color='text.secondary'>
          Ya tienes acceso con Google. Añade el nombre de tu empresa para comenzar.
        </Typography>
        <Typography variant='body2' sx={{ overflowWrap: 'anywhere' }}>
          {email}
        </Typography>
        <TextField
          autoFocus
          required
          fullWidth
          label='Nombre de la empresa'
          value={companyName}
          onChange={event => setCompanyName(event.target.value)}
          disabled={pending}
          inputProps={{ maxLength: 120 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptedTerms}
              onChange={event => setAcceptedTerms(event.target.checked)}
              disabled={pending}
              required
            />
          }
          label={
            <Typography variant='body2'>
              Acepto la{' '}
              <Link href='/privacy-policy' target='_blank' rel='noopener'>
                política de privacidad
              </Link>{' '}
              y las{' '}
              <Link href='/terms-of-service' target='_blank' rel='noopener'>
                condiciones de servicio
              </Link>
              .
            </Typography>
          }
        />
        {error ? <Alert severity='error'>{error}</Alert> : null}
        <Button type='submit' variant='contained' disabled={pending || !acceptedTerms || !companyName.trim()}>
          {pending ? 'Creando espacio…' : 'Crear espacio y entrar'}
        </Button>
        <Button type='button' disabled={pending} onClick={() => signOut({ callbackUrl: '/login' })}>
          Usar otra cuenta
        </Button>
      </Stack>
    </Card>
  )
}
