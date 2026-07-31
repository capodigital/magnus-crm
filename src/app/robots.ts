import type { MetadataRoute } from 'next'

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: '*',
      allow: ['/', '/privacy-policy', '/terms-of-service'],
      disallow: ['/api/', '/home', '/inbox', '/leads', '/pipeline', '/billing', '/settings', '/login', '/register']
    }
  ],
  sitemap: 'https://crm.magnusecosystems.com/sitemap.xml',
  host: 'https://crm.magnusecosystems.com'
})

export default robots
