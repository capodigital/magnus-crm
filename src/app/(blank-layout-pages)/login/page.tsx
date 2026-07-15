// Next Imports
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

// Component Imports
import Login from '@views/Login'

// Auth Imports
import { auth } from '@/lib/auth'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Sign in | Magnus CRM',
  description: 'Access your Magnus CRM workspace'
}

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

const LoginPage = async ({ searchParams }: Props) => {
  // Vars
  const mode = await getServerMode()
  const session = await auth()
  const resolvedSearchParams = searchParams ?? {}
  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === 'string' ? resolvedSearchParams.callbackUrl : '/home'
  const safeCallbackUrl = callbackUrl.startsWith('/') ? callbackUrl : '/home'

  if (session?.user) {
    redirect(safeCallbackUrl)
  }

  return (
    <Login
      mode={mode}
      callbackUrl={safeCallbackUrl}
      hasGoogleProvider={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
    />
  )
}

export default LoginPage
