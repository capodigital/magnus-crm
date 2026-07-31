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

const appUrl = 'https://crm.magnusecosystems.com'

const appDescription =
  'CRM de WhatsApp para equipos comerciales que necesitan captar leads, centralizar conversaciones y operar con orden.'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: 'Magnus CRM',
  title: {
    default: 'Magnus CRM',
    template: '%s | Magnus CRM'
  },
  description: appDescription,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
    shortcut: '/favicon.ico'
  },
  openGraph: {
    siteName: 'Magnus CRM',
    title: 'Magnus CRM',
    description: appDescription,
    url: appUrl,
    type: 'website',
    locale: 'es_ES',
    images: [
      {
        url: '/images/brand/magnus-crm-og.png',
        width: 1200,
        height: 630,
        alt: 'Magnus CRM - CRM de WhatsApp para captar leads'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Magnus CRM',
    description: appDescription,
    images: ['/images/brand/magnus-crm-og.png']
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
