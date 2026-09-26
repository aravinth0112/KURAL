import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/adminnadhan/', '/adminnadhan'],
    },
    sitemap: 'https://lputamizhans.com/sitemap.xml',
  }
}
