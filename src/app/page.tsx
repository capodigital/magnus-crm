import type { Metadata } from 'next'

import LandingPage from '@/components/marketing/LandingPage'
import PublicSiteShell from '@/components/marketing/PublicSiteShell'

export const metadata: Metadata = {
  title: { absolute: 'Magnus CRM | Clientes, ventas y conversaciones' },
  description:
    'Magnus CRM, de Magnus Ecosystems: gestiona clientes, leads, oportunidades, WhatsApp, campañas de email y seguimiento comercial.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Magnus CRM | Clientes, ventas y conversaciones',
    description:
      'Centraliza conversaciones de WhatsApp, organiza leads y convierte mensajes en pipeline desde un solo CRM.',
    url: 'https://crm.magnusecosystems.com',
    type: 'website'
  }
}

const RootPage = () => {
  return (
    <PublicSiteShell>
      <LandingPage />
    </PublicSiteShell>
  )
}

export default RootPage
