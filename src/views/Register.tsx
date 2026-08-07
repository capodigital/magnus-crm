'use client'

// React Imports
import { useState, type FormEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

import { signIn } from 'next-auth/react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 600,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 345,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

type RegisterProps = {
  mode: SystemMode
  callbackUrl: string
  hasGoogleProvider: boolean
}

const Register = ({ mode, callbackUrl, hasGoogleProvider }: RegisterProps) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const safeCallbackUrl = callbackUrl.startsWith('/') ? callbackUrl : '/home'

  const googleProviderMessage = hasGoogleProvider
    ? 'El acceso con Google quedara para login de usuarios despues de crear el workspace.'
    : 'Google tambien podra usarse mas adelante cuando carguemos esas credenciales.'

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!acceptedTerms) {
      setErrorMessage('Necesitas aceptar la politica de privacidad y las condiciones de servicio.')

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
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <RegisterIllustration src={characterIllustration} alt='Magnus CRM register illustration' />
        {!hidden && <MaskImg alt='Magnus CRM background mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[500px]'>
        <Link href='/' className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[420px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`Registra tu empresa en ${themeConfig.templateName}`}</Typography>
            <Typography color='text.secondary'>
              Crea el workspace de tu empresa y tu usuario owner para probar el CRM con WhatsApp. El pago queda fuera de
              este primer flujo.
            </Typography>
          </div>

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
              placeholder='Nombre del owner'
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
              label='Contrasena'
              placeholder='Minimo 8 caracteres'
              type={isPasswordShown ? 'text' : 'password'}
              autoComplete='new-password'
              value={password}
              onChange={event => setPassword(event.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
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
                    politica de privacidad
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

            <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Creando empresa...' : 'Crear empresa y entrar'}
            </Button>

            <Box className='rounded-lg border border-dashed border-textDisabled/30 px-4 py-3'>
              <Stack spacing={0.5}>
                <Typography variant='body2' color='text.secondary'>
                  Por ahora todos los workspaces entran desde el dominio principal del CRM; no se creara un subdominio
                  para tu empresa.
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {googleProviderMessage}
                </Typography>
              </Stack>
            </Box>
          </form>

          <Typography variant='body2' color='text.secondary'>
            Ya tienes acceso?{' '}
            <Typography component={Link} href='/login' color='primary.main'>
              Iniciar sesion
            </Typography>
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default Register
