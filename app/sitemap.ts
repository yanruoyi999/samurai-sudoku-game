import { MetadataRoute } from 'next'
import { locales } from '@/i18n'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://samurai-sudoku.com' // TODO: Update with actual domain

  // Generate sitemap for all locales
  const routes = [
    '',
    '/games/samurai',
    '/games/samurai/archive',
  ]

  const sitemap: MetadataRoute.Sitemap = []

  // Add routes for each locale
  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : route.includes('archive') ? 'weekly' : 'daily',
        priority: route === '' ? 1 : route.includes('archive') ? 0.8 : 0.9,
        alternates: {
          languages: {
            en: `${baseUrl}/en${route}`,
            zh: `${baseUrl}/zh${route}`,
          },
        },
      })
    })
  })

  return sitemap
}
