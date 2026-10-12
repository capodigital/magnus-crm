import type { MetadataRoute } from 'next'

const manifest = (): MetadataRoute.Manifest => ({
  name: 'Magnus CRM',
  short_name: 'Magnus CRM',
  description:
    'CRM para organizar contactos, oportunidades y conversaciones y conectar las herramientas de tu negocio.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#F4F7FA',
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
