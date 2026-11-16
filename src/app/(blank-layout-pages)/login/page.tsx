// Next Imports
import { redirect } from 'next/navigation'

import type { Metadata } from 'next'

// Component Imports
import Login from '@views/Login'

// Auth Imports
import { auth } from '@/lib/auth'
import { hasGoogleProvider } from '@/lib/auth/google'
import { authErrorMessage, safeCallbackPath } from '@/lib/auth/navigation'

export const metadata: Metadata = {
  title: 'Iniciar sesion',
  description: 'Accede a tu workspace de Magnus CRM.',
  robots: {
    index: false,
    follow: false
  }
}

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const LoginPage = async ({ searchParams }: Props) => {
  // Vars
  const session = await auth()
  const resolvedSearchParams = (await searchParams) ?? {}

  const callbackUrl = typeof resolvedSearchParams.callbackUrl === 'string' ? resolvedSearchParams.callbackUrl : '/home'

  const safeCallbackUrl = safeCallbackPath(callbackUrl)

  if (session?.user) {
    if (typeof resolvedSearchParams.error === 'string')
      redirect(`/settings?error=${encodeURIComponent(resolvedSearchParams.error)}`)
    redirect(safeCallbackUrl)
  }

  return (
    <Login
      callbackUrl={safeCallbackUrl}
      hasGoogleProvider={hasGoogleProvider()}
      initialError={authErrorMessage(resolvedSearchParams.error)}
    />
  )
}

export default LoginPage
