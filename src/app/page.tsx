import { redirect } from 'next/navigation'

import type { Metadata } from 'next'

import LandingPage from '@/components/marketing/LandingPage'
import PublicSiteShell from '@/components/marketing/PublicSiteShell'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'CRM de WhatsApp para ventas',
  description:
    'Landing oficial de Magnus CRM para crm.magnusecosystems.com con acceso al login, registro y documentos legales.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Magnus CRM | CRM de WhatsApp para ventas',
    description:
      'Centraliza conversaciones de WhatsApp, organiza leads y convierte mensajes en pipeline desde un solo CRM.',
    url: 'https://crm.magnusecosystems.com',
    type: 'website'
  }
}

const RootPage = async () => {
  const session = await auth()

  if (session?.user) {
    redirect('/home')
  }

  return (
    <PublicSiteShell>
      <LandingPage />
    </PublicSiteShell>
  )
}

export default RootPage
