'use client'

import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'

import { parseEmbeddedSignupMessage, type EmbeddedSignupSessionInfo } from '@/lib/whatsapp/embedded-signup-message'

type WhatsappEmbeddedSignupPanelProps = {
  workspaceName: string | null
  isConfigured: boolean
  initialPhoneNumber: {
    phoneNumberId: string
    displayPhoneNumber: string | null
    verifiedName: string | null
    connectionSource: 'MANUAL' | 'EMBEDDED_SIGNUP'
    registrationStatus: 'PENDING' | 'REGISTERED' | 'FAILED'
  } | null
}

type FacebookSdk = {
  init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void
  login: (
    callback: (response: { authResponse?: { code?: string }; status?: string }) => void,
    options: {
      config_id: string
      response_type: 'code'
      override_default_response_type: true
      extras: Record<string, unknown>
    }
  ) => void
}

type EmbeddedSignupResponse = {
  result?: {
    displayPhoneNumber: string | null
    verifiedName: string | null
  }
  error?: string
}

type PhoneRegistrationResponse = {
  result?: {
    registrationStatus: 'REGISTERED'
  }
  error?: string
}

const FACEBOOK_SDK_ID = 'facebook-jssdk'

const FACEBOOK_MESSAGE_ORIGINS = new Set([
  'https://www.facebook.com',
  'https://web.facebook.com',
  'https://business.facebook.com'
])

const getPublicConfig = () => ({
  appId: process.env.NEXT_PUBLIC_META_APP_ID?.trim() ?? '',
  configId: process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() ?? '',
  graphVersion: process.env.NEXT_PUBLIC_META_GRAPH_API_VERSION?.trim() || 'v26.0'
})

const loadFacebookSdk = async (config: ReturnType<typeof getPublicConfig>) => {
  const windowWithFacebook = window as typeof window & {
    FB?: FacebookSdk
    __magnusFacebookInitialized?: boolean
  }

  if (!windowWithFacebook.FB) {
    const existingScript = document.getElementById(FACEBOOK_SDK_ID)

    if (!existingScript) {
      const script = document.createElement('script')

      script.id = FACEBOOK_SDK_ID
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      document.body.appendChild(script)
    }

    await new Promise<void>((resolve, reject) => {
      const startedAt = Date.now()

      const checkForSdk = () => {
        if (windowWithFacebook.FB) {
          resolve()

          return
        }

        if (Date.now() - startedAt > 10000) {
          reject(new Error('No pudimos cargar la conexión segura de Meta.'))

          return
        }

        window.setTimeout(checkForSdk, 50)
      }

      checkForSdk()
    })
  }

  if (!windowWithFacebook.__magnusFacebookInitialized && windowWithFacebook.FB) {
    windowWithFacebook.FB.init({
      appId: config.appId,
      cookie: true,
      xfbml: false,
      version: config.graphVersion
    })
    windowWithFacebook.__magnusFacebookInitialized = true
  }

  if (!windowWithFacebook.FB) {
    throw new Error('La conexión con Meta no está disponible en este momento.')
  }

  return windowWithFacebook.FB
}

const WhatsappEmbeddedSignupPanel = ({
  workspaceName,
  isConfigured,
  initialPhoneNumber
}: WhatsappEmbeddedSignupPanelProps) => {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationPin, setRegistrationPin] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState<string | null>(null)
  const [registrationErrorMessage, setRegistrationErrorMessage] = useState<string | null>(null)
  const stateRef = useRef<string | null>(null)
  const codeRef = useRef<string | null>(null)
  const sessionInfoRef = useRef<EmbeddedSignupSessionInfo | null>(null)
  const isSubmittingRef = useRef(false)
  const isConnectingRef = useRef(false)
  const facebookRef = useRef<FacebookSdk | null>(null)
  const prepareSignupRef = useRef<() => void>(() => undefined)
  const completeSignupRef = useRef<() => void>(() => undefined)

  completeSignupRef.current = () => {
    const state = stateRef.current
    const code = codeRef.current
    const sessionInfo = sessionInfoRef.current

    if (!state || !code || !sessionInfo || isSubmittingRef.current) return

    isSubmittingRef.current = true
    setIsConnecting(true)

    void (async () => {
      const response = await fetch('/api/workspace/whatsapp-embedded-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          state,
          code,
          ...sessionInfo
        })
      })

      const payload = (await response.json().catch(() => null)) as EmbeddedSignupResponse | null

      isSubmittingRef.current = false
      isConnectingRef.current = false
      setIsConnecting(false)

      if (!response.ok || !payload?.result) {
        setErrorMessage(payload?.error ?? 'No pudimos conectar el número de WhatsApp.')
        prepareSignupRef.current()

        return
      }

      setSuccessMessage(
        'WhatsApp conectado' + (payload.result.displayPhoneNumber ? ': ' + payload.result.displayPhoneNumber : '') + '.'
      )
      stateRef.current = null
      setIsReady(false)
      router.refresh()
      prepareSignupRef.current()
    })().catch(() => {
      isSubmittingRef.current = false
      isConnectingRef.current = false
      setIsConnecting(false)
      setErrorMessage('No pudimos completar la conexión con Meta. Inténtalo nuevamente.')
      prepareSignupRef.current()
    })
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (!FACEBOOK_MESSAGE_ORIGINS.has(event.origin)) return

      const parsedMessage = parseEmbeddedSignupMessage(event.data)

      if (!parsedMessage) return

      if ('error' in parsedMessage) {
        setErrorMessage(parsedMessage.error)
        isConnectingRef.current = false
        setIsConnecting(false)

        return
      }

      sessionInfoRef.current = parsedMessage
      completeSignupRef.current()
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (!isConfigured) return

    let disposed = false

    const prepare = async () => {
      if (isConnectingRef.current) return

      try {
        const [stateResponse, facebook] = await Promise.all([
          fetch('/api/workspace/whatsapp-embedded-signup/state', { method: 'POST' }),
          loadFacebookSdk(getPublicConfig())
        ])

        const statePayload = (await stateResponse.json().catch(() => null)) as { state?: string; error?: string } | null

        if (!stateResponse.ok || !statePayload?.state) {
          throw new Error(statePayload?.error ?? 'No pudimos preparar la sesión segura con Meta.')
        }

        if (disposed) return

        stateRef.current = statePayload.state
        facebookRef.current = facebook
        setIsReady(true)
      } catch (error) {
        if (disposed) return

        setIsReady(false)
        setErrorMessage(error instanceof Error ? error.message : 'No pudimos preparar la conexión con Meta.')
      }
    }

    prepareSignupRef.current = () => {
      void prepare()
    }

    void prepare()

    const refreshTimer = window.setInterval(() => {
      void prepare()
    }, 5 * 60 * 1000)

    return () => {
      disposed = true
      window.clearInterval(refreshTimer)
      prepareSignupRef.current = () => undefined
    }
  }, [isConfigured])

  const handleConnect = () => {
    const config = getPublicConfig()
    const facebook = facebookRef.current

    setErrorMessage(null)
    setSuccessMessage(null)

    if (!isConfigured || !config.appId || !config.configId || !isReady || !facebook || !stateRef.current) {
      setErrorMessage('La conexión segura con Meta todavía se está preparando. Inténtalo en unos segundos.')

      return
    }

    isConnectingRef.current = true
    setIsConnecting(true)
    codeRef.current = null
    sessionInfoRef.current = null

    facebook.login(
      response => {
        const code = response.authResponse?.code?.trim()

        if (!code) {
          isConnectingRef.current = false
          setIsConnecting(false)
          setErrorMessage('La conexión con Meta fue cancelada o no devolvió un código válido.')
          prepareSignupRef.current()

          return
        }

        codeRef.current = code
        completeSignupRef.current()
      },
      {
        config_id: config.configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: 'whatsapp_business_app_onboarding',
          ...(process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_SOLUTION_ID
            ? { solutionID: process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_SOLUTION_ID }
            : {})
        }
      }
    )
  }

  const handleRegisterPhone = async () => {
    if (!initialPhoneNumber) return

    setIsRegistering(true)
    setRegistrationSuccessMessage(null)
    setRegistrationErrorMessage(null)

    try {
      const response = await fetch('/api/workspace/whatsapp-phone-number/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumberId: initialPhoneNumber.phoneNumberId,
          pin: registrationPin
        })
      })

      const payload = (await response.json().catch(() => null)) as PhoneRegistrationResponse | null

      if (!response.ok || !payload?.result) {
        setRegistrationErrorMessage(payload?.error ?? 'No pudimos registrar el número con Meta.')

        return
      }

      setRegistrationPin('')
      setRegistrationSuccessMessage('Número registrado y listo para enviar mensajes.')
      router.refresh()
    } catch {
      setRegistrationErrorMessage('No pudimos completar el registro del número con Meta.')
    } finally {
      setIsRegistering(false)
    }
  }

  const isEmbeddedConnection = initialPhoneNumber?.connectionSource === 'EMBEDDED_SIGNUP'
  const needsPhoneRegistration = isEmbeddedConnection && initialPhoneNumber?.registrationStatus !== 'REGISTERED'

  return (
    <Card variant='outlined'>
      <CardContent sx={{ p: { xs: 4, md: 5 } }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent='space-between'
          >
            <Stack spacing={1}>
              <Typography variant='h5' component='h2' sx={{ fontWeight: 800 }}>
                Conectar WhatsApp con Meta
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Autoriza el número de WhatsApp del workspace {workspaceName ? '"' + workspaceName + '"' : 'actual'}{' '}
                desde Meta. Cada workspace conserva su propia conexión.
              </Typography>
            </Stack>
            {initialPhoneNumber ? (
              <Chip
                color={isEmbeddedConnection ? 'success' : 'default'}
                label={isEmbeddedConnection ? 'Conectado con Meta' : 'Conexión manual'}
                variant='outlined'
              />
            ) : null}
          </Stack>

          <Alert severity='info'>
            Necesitas ser administrador del Business Portfolio. Meta abrirá su flujo seguro para seleccionar el WABA y
            el número; el CRM no solicita ni muestra tu contraseña de Meta.
          </Alert>

          {!isConfigured ? (
            <Alert severity='warning'>
              Falta configurar el App ID público y privado, el Config ID de Embedded Signup, el secreto de Meta o una
              clave de cifrado Base64 válida de 32 bytes en Vercel.
            </Alert>
          ) : null}

          {successMessage ? <Alert severity='success'>{successMessage}</Alert> : null}
          {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}

          <Button variant='contained' onClick={handleConnect} disabled={isConnecting || !isConfigured || !isReady}>
            {isConnecting ? 'Conectando con Meta...' : 'Conectar número desde Meta'}
          </Button>

          {!isReady && isConfigured && !isConnecting ? (
            <Typography variant='caption' color='text.secondary'>
              Preparando la conexión segura de Meta...
            </Typography>
          ) : null}

          {initialPhoneNumber?.displayPhoneNumber || initialPhoneNumber?.verifiedName ? (
            <Typography variant='caption' color='text.secondary'>
              Conexión actual: {initialPhoneNumber.verifiedName ?? 'Sin nombre verificado'}
              {initialPhoneNumber.displayPhoneNumber ? ' · ' + initialPhoneNumber.displayPhoneNumber : ''}
            </Typography>
          ) : null}

          {needsPhoneRegistration ? (
            <Stack spacing={2}>
              <Alert severity='warning'>
                Meta requiere registrar el número con un PIN de seis dígitos para habilitar el envío. El PIN no se
                guarda en el CRM.
              </Alert>
              <CustomTextField
                fullWidth
                label='PIN de registro de WhatsApp'
                placeholder='123456'
                value={registrationPin}
                onChange={event => setRegistrationPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                type='password'
              />
              {registrationSuccessMessage ? <Alert severity='success'>{registrationSuccessMessage}</Alert> : null}
              {registrationErrorMessage ? <Alert severity='error'>{registrationErrorMessage}</Alert> : null}
              <Button
                variant='outlined'
                onClick={handleRegisterPhone}
                disabled={isRegistering || registrationPin.length !== 6}
              >
                {isRegistering ? 'Registrando número...' : 'Registrar número en Meta'}
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default WhatsappEmbeddedSignupPanel
