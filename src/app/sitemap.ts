import type { MetadataRoute } from 'next'

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: 'https://crm.magnusecosystems.com/',
    lastModified: '2026-07-31',
    changeFrequency: 'weekly',
    priority: 1
  },
  {
    url: 'https://crm.magnusecosystems.com/privacy-policy',
    lastModified: '2026-07-31',
    changeFrequency: 'monthly',
    priority: 0.5
  },
  {
    url: 'https://crm.magnusecosystems.com/terms-of-service',
    lastModified: '2026-07-31',
    changeFrequency: 'monthly',
    priority: 0.5
  }
]

export default sitemap
