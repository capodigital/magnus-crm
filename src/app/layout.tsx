import type { Metadata } from 'next'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://crm.magnusecosystems.com'),
  applicationName: 'Magnus CRM',
  title: {
    default: 'Magnus CRM',
    template: '%s | Magnus CRM'
  },
  description:
    'CRM de WhatsApp para equipos comerciales que necesitan captar leads, centralizar conversaciones y operar con orden.',
  openGraph: {
    siteName: 'Magnus CRM',
    title: 'Magnus CRM',
    description:
      'CRM de WhatsApp para equipos comerciales que necesitan captar leads, centralizar conversaciones y operar con orden.',
    url: 'https://crm.magnusecosystems.com',
    type: 'website',
    locale: 'es_ES'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Magnus CRM',
    description:
      'CRM de WhatsApp para equipos comerciales que necesitan captar leads, centralizar conversaciones y operar con orden.'
  },
  robots: {
    index: true,
    follow: true
  }
}

const RootLayout = async (props: ChildrenType) => {
  const { children } = props

  // Type guard to ensure lang is a valid Locale

  // Vars

  const systemMode = await getSystemMode()
  const direction = 'ltr'

  return (
    <html id='__next' lang='es' dir={direction} suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        {children}
      </body>
    </html>
  )
}

export default RootLayout
