import { Metadata } from 'next'

export const siteConfig = {
  name: 'Class Response System',
  shortName: 'CRS',
  description: 'Transform your educational feedback with intelligent analytics, real-time insights, and seamless anonymous response collection with CLO mapping.',
  url: 'https://classresponsesystem.com',
  ogImage: 'https://classresponsesystem.com/og-image.png',
  creator: '@classresponse',
  keywords: [
    'educational feedback',
    'classroom response system',
    'AI-powered analytics',
    'anonymous feedback',
    'CLO mapping',
    'Bloom\'s Taxonomy',
    'student feedback',
    'course learning outcomes',
    'sentiment analysis',
    'educational technology',
    'real-time feedback',
    'QR code feedback',
    'teacher analytics',
    'classroom engagement',
    'assessment tools',
  ],
  authors: [
    {
      name: 'Class Response System',
      url: 'https://classresponsesystem.com',
    },
  ],
  themeColor: '#468cfe',
  email: 'classresponsesystem@gmail.com',
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name + ' - AI-Powered Educational Feedback',
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  themeColor: siteConfig.themeColor,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteConfig.url,
  },
  verification: {
    // Add your verification tokens here when you have them
    google: '', // Google Search Console verification
    // yandex: '',
    // bing: '',
  },
}

// JSON-LD structured data for the organization
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  email: siteConfig.email,
  sameAs: [
    // Add social media profiles here when available
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: siteConfig.email,
    contactType: 'customer support',
  },
}

// JSON-LD structured data for the software application
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: siteConfig.name,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: siteConfig.description,
  url: siteConfig.url,
  screenshot: siteConfig.ogImage,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '127',
  },
  featureList: [
    'AI-Powered Analytics',
    'Anonymous Feedback Collection',
    'CLO Mapping',
    'Real-time Insights',
    'QR Code Sessions',
    'Sentiment Analysis',
    'Bloom\'s Taxonomy Classification',
  ],
}

// Helper function to generate page-specific metadata
export function generatePageMetadata(params: {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const { title, description, image, noIndex } = params

  return {
    title: title || siteConfig.name,
    description: description || siteConfig.description,
    openGraph: {
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      images: image ? [image] : [siteConfig.ogImage],
    },
    twitter: {
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      images: image ? [image] : [siteConfig.ogImage],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}
