import type { MetadataRoute } from 'next'

const manifest = (): MetadataRoute.Manifest => ({
  name: 'Magnus CRM',
  short_name: 'Magnus CRM',
  description:
    'CRM de WhatsApp para equipos comerciales que necesitan captar leads, centralizar conversaciones y operar con orden.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#F6F8F5',
  theme_color: '#0F766E',
  icons: [
    {
      src: '/icon.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/images/brand/magnus-crm-app-icon-1024.png',
      sizes: '1024x1024',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/apple-icon.png',
      sizes: '180x180',
      type: 'image/png',
      purpose: 'any'
    }
  ]
})

export default manifest
