/* eslint-disable */
'use client'

// React Imports
import { useState, type FormEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Component Imports
import Link from '@components/Link'
import CustomTextField from '@core/components/mui/TextField'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import AuthPageLayout from '@/components/auth/AuthPageLayout'
import { safeCallbackPath } from '@/lib/auth/navigation'

// Config Imports
import themeConfig from '@configs/themeConfig'

type LoginProps = {
  callbackUrl: string
  hasGoogleProvider: boolean
  initialError?: string | null
}

const LoginV2 = ({ callbackUrl, hasGoogleProvider, initialError }: LoginProps) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError ?? null)
  const [googlePending, setGooglePending] = useState(false)

  const router = useRouter()

  const safeCallbackUrl = safeCallbackPath(callbackUrl)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || googlePending) return
    setIsSubmitting(true)
    setErrorMessage(null)

    const response = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: safeCallbackUrl
    })

    setIsSubmitting(false)

    if (!response || response.error) {
      setErrorMessage('No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.')
      return
    }

    router.replace(response.url ?? safeCallbackUrl)
    router.refresh()
  }

  return (
    <AuthPageLayout variant='login'>
      <div className='flex flex-col gap-1'>
        <Typography variant='h4' component='h1'>{`Bienvenido a ${themeConfig.templateName}`}</Typography>
        <Typography color='text.secondary'>
          Accede a tu espacio de trabajo para consultar clientes, oportunidades y conversaciones.
        </Typography>
      </div>

      <GoogleSignInButton
        available={hasGoogleProvider}
        callbackUrl={`/onboarding?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`}
        disabled={isSubmitting}
        onBusy={setGooglePending}
      />
      <Divider>o continúa con tu email</Divider>
      <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <CustomTextField
          autoFocus
          fullWidth
          label='Email'
          placeholder='tu@empresa.com'
          type='email'
          autoComplete='email'
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <CustomTextField
          fullWidth
          label='Contraseña'
          placeholder='Ingresa tu contraseña'
          id='outlined-adornment-password'
          type={isPasswordShown ? 'text' : 'password'}
          autoComplete='current-password'
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

        {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}

        <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
          <FormControlLabel control={<Checkbox />} label='Recordarme' />
          <Typography component='span' variant='body2' color='text.secondary'>
            Tu espacio de trabajo
          </Typography>
        </div>

        <Button fullWidth variant='contained' type='submit' disabled={isSubmitting || googlePending}>
          {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </Button>
      </form>

      <Stack spacing={1.5}>
        <Typography variant='body2' color='text.secondary'>
          ¿No tienes cuenta todavía?{' '}
          <Typography
            component={Link}
            href={`/register?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`}
            color='primary.main'
          >
            Crear acceso
          </Typography>
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Al continuar aceptas nuestra{' '}
          <Typography component={Link} href='/privacy-policy' color='primary.main'>
            política de privacidad
          </Typography>{' '}
          y las{' '}
          <Typography component={Link} href='/terms-of-service' color='primary.main'>
            condiciones de servicio
          </Typography>
          .
        </Typography>
      </Stack>
    </AuthPageLayout>
  )
}

export default LoginV2
