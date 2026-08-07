// Next Imports
import { redirect } from 'next/navigation'

import type { Metadata } from 'next'

// Component Imports
import Register from '@views/Register'

// Auth Imports
import { auth } from '@/lib/auth'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Registrar empresa',
  description: 'Registra tu empresa y crea tu usuario owner en Magnus CRM.',
  robots: {
    index: false,
    follow: false
  }
}

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const RegisterPage = async ({ searchParams }: Props) => {
  // Vars
  const mode = await getServerMode()
  const session = await auth()
  const resolvedSearchParams = (await searchParams) ?? {}
  const callbackUrl = typeof resolvedSearchParams.callbackUrl === 'string' ? resolvedSearchParams.callbackUrl : '/home'
  const safeCallbackUrl = callbackUrl.startsWith('/') ? callbackUrl : '/home'

  if (session?.user) {
    redirect(safeCallbackUrl)
  }

  return (
    <Register
      mode={mode}
      callbackUrl={safeCallbackUrl}
      hasGoogleProvider={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
    />
  )
}

export default RegisterPage

