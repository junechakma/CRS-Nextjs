import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Class Response System - AI-Powered Educational Feedback',
    short_name: 'CRS',
    description: 'Transform your educational feedback with intelligent analytics, real-time insights, and seamless anonymous response collection with CLO mapping.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#468cfe',
    orientation: 'portrait',
    categories: ['education', 'productivity', 'analytics'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
