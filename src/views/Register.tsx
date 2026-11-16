'use client'

// React Imports
import { useState, type FormEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

import { signIn } from 'next-auth/react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'

// Component Imports
import Link from '@components/Link'
import CustomTextField from '@core/components/mui/TextField'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import AuthPageLayout from '@/components/auth/AuthPageLayout'
import { safeCallbackPath } from '@/lib/auth/navigation'

// Config Imports
import themeConfig from '@configs/themeConfig'

type RegisterProps = {
  callbackUrl: string
  hasGoogleProvider: boolean
}

const Register = ({ callbackUrl, hasGoogleProvider }: RegisterProps) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googlePending, setGooglePending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const router = useRouter()

  const safeCallbackUrl = safeCallbackPath(callbackUrl)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || googlePending) return

    if (!acceptedTerms) {
      setErrorMessage('Necesitas aceptar la política de privacidad y las condiciones de servicio.')

      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyName,
        name,
        email,
        password
      })
    })

    const payload = (await response.json().catch(() => null)) as { error?: string } | null

    if (!response.ok) {
      setErrorMessage(payload?.error ?? 'No pudimos crear la empresa ahora mismo.')
      setIsSubmitting(false)

      return
    }

    const signInResponse = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: safeCallbackUrl
    })

    setIsSubmitting(false)

    if (!signInResponse || signInResponse.error) {
      router.push(`/login?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`)

      return
    }

    router.replace(signInResponse.url ?? safeCallbackUrl)
    router.refresh()
  }

  return (
    <AuthPageLayout variant='register'>
      <div className='flex flex-col gap-1'>
        <Typography variant='h4' component='h1'>{`Registra tu empresa en ${themeConfig.templateName}`}</Typography>
        <Typography color='text.secondary'>
          Crea el espacio de trabajo de tu empresa para organizar clientes, oportunidades y conversaciones.
        </Typography>
      </div>

      <GoogleSignInButton
        available={hasGoogleProvider}
        callbackUrl={`/onboarding?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`}
        disabled={isSubmitting}
        onBusy={setGooglePending}
      />
      <Divider>o regístrate con tu email</Divider>
      <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <CustomTextField
          autoFocus
          fullWidth
          label='Empresa'
          placeholder='Magnus Ecosystems'
          value={companyName}
          onChange={event => setCompanyName(event.target.value)}
        />
        <CustomTextField
          fullWidth
          label='Tu nombre'
          placeholder='Tu nombre completo'
          value={name}
          onChange={event => setName(event.target.value)}
        />
        <CustomTextField
          fullWidth
          label='Email de trabajo'
          placeholder='tu@empresa.com'
          type='email'
          autoComplete='email'
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <CustomTextField
          fullWidth
          label='Contraseña'
          placeholder='Mínimo 8 caracteres'
          type={isPasswordShown ? 'text' : 'password'}
          autoComplete='new-password'
          value={password}
          onChange={event => setPassword(event.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label={isPasswordShown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    edge='end'
                    onClick={handleClickShowPassword}
                    onMouseDown={e => e.preventDefault()}
                  >
                    <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />

        <FormControlLabel
          control={<Checkbox checked={acceptedTerms} onChange={event => setAcceptedTerms(event.target.checked)} />}
          label={
            <Typography variant='body2' color='text.secondary'>
              Acepto la{' '}
              <Typography component={Link} href='/privacy-policy' color='primary.main'>
                política de privacidad
              </Typography>{' '}
              y las{' '}
              <Typography component={Link} href='/terms-of-service' color='primary.main'>
                condiciones de servicio
              </Typography>
              .
            </Typography>
          }
        />

        {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}

        <Button fullWidth variant='contained' type='submit' disabled={isSubmitting || googlePending}>
          {isSubmitting ? 'Creando empresa…' : 'Crear empresa y entrar'}
        </Button>
      </form>

      <Typography variant='body2' color='text.secondary'>
        ¿Ya tienes acceso?{' '}
        <Typography
          component={Link}
          href={`/login?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`}
          color='primary.main'
        >
          Iniciar sesión
        </Typography>
      </Typography>
    </AuthPageLayout>
  )
}

export default Register
