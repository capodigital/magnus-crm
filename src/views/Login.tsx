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
import Divider from '@mui/material/Divider'
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

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
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
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

type LoginProps = {
  mode: SystemMode
  callbackUrl: string
  hasGoogleProvider: boolean
}

const LoginV2 = ({ mode, callbackUrl, hasGoogleProvider }: LoginProps) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
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

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
      setErrorMessage('No pudimos iniciar sesión. Revisa tus credenciales e intenta de nuevo.')
      return
    }

    router.replace(response.url ?? safeCallbackUrl)
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    await signIn('google', {
      callbackUrl: safeCallbackUrl
    })
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
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link href='/' className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`Bienvenido a ${themeConfig.templateName}`}</Typography>
            <Typography color='text.secondary'>
              Accede con tu correo y contraseña. Google aparecerá cuando el cliente esté configurado.
            </Typography>
          </div>
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
              label='Password'
              placeholder='••••••••••••'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              autoComplete='current-password'
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
            {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel control={<Checkbox />} label='Remember me' />
              <Typography component='span' variant='body2' color='text.secondary'>
                Invite-based workspace access
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            {hasGoogleProvider ? (
              <>
                <Divider className='gap-2 text-textPrimary'>or</Divider>
                <Button
                  fullWidth
                  variant='outlined'
                  type='button'
                  onClick={handleGoogleSignIn}
                  startIcon={<i className='tabler-brand-google-filled' />}
                >
                  Continue with Google
                </Button>
              </>
            ) : (
              <Box className='rounded-lg border border-dashed border-textDisabled/30 px-4 py-3'>
                <Stack spacing={0.5}>
                  <Typography variant='body2' color='text.secondary'>
                    Google sign-in will appear once the client credentials are configured.
                  </Typography>
                </Stack>
              </Box>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
