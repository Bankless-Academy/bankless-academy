import NextHead from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'

import {
  PROJECT_NAME,
  DOMAIN_PROD,
  DOMAIN_URL,
  DEFAULT_METADATA,
  FAVICON,
  UMAMI_PROD,
  APPLE_TOUCH_ICON,
  APPLE_TOUCH_STARTUP_IMAGE,
  IS_PROD,
} from 'constants/index'
import { useEffect } from 'react'
import { LessonType } from 'entities/lesson'

export interface MetaData {
  title?: string
  description?: string
  image?: string
  isLesson?: boolean
  lesson?: LessonType
  canonical?: string
  noindex?: boolean
  nolayout?: boolean
}

const umamiWebsiteId =
  typeof window !== 'undefined' &&
  window.location.hostname === DOMAIN_PROD &&
  UMAMI_PROD
    ? // prod
      UMAMI_PROD
    : // dev
      'e84c3a1e-0ab0-4502-b0fe-67d660765535'
const umamiDomain = 'https://stats.banklessacademy.com/stats.js'

const Head = ({ metadata }: { metadata: MetaData }): React.ReactElement => {
  const router = useRouter()
  const title = metadata?.title
    ? `${metadata.title} | ${PROJECT_NAME}`
    : PROJECT_NAME
  const description = metadata?.description || DEFAULT_METADATA.description
  const image = metadata?.image
    ? `${metadata?.image.startsWith('http') ? '' : DOMAIN_URL}${
        metadata?.image
      }`
    : `${DOMAIN_URL}${DEFAULT_METADATA.image}`
  const url = `${DOMAIN_URL}${router.asPath}`

  useEffect(() => {
    /* Hotjar */
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'app.banklessacademy.com'
    ) {
      import('react-hotjar').then((hotjarLib) => {
        hotjarLib.hotjar.initialize(2568813, 6)
      })
    }
  }, [])

  const canonical = url?.split('?')[0]

  return (
    <>
      <NextHead>
        <title>{title}</title>
        <meta name="description" content={description} />
        {/* Open Graph / Facebook (needs to be < 300kb to work on WhatsApp) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="628" />
        <link
          rel="canonical"
          href={
            metadata?.canonical
              ? `${DOMAIN_URL}${metadata.canonical}`
              : canonical
          }
        />
        {/* Robot indexing: only index in production */}
        <meta
          name="robots"
          content={IS_PROD && !metadata?.noindex ? 'all' : 'noindex'}
        ></meta>
        {/* Twitter */}
        <meta property="twitter:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        {/* shortcut icon */}
        <link
          rel="shortcut icon"
          sizes="200x200"
          type="image/png"
          href={FAVICON}
        />
        {/* Progressive Web App */}
        <link rel="apple-touch-icon" href={APPLE_TOUCH_ICON} />
        <link
          rel="apple-touch-startup-image"
          href={APPLE_TOUCH_STARTUP_IMAGE}
        />
        <meta name="apple-mobile-web-app-title" content={PROJECT_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link
          rel="manifest"
          crossOrigin="use-credentials"
          href="/manifest.json"
        />
        {/* RSS Feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Bankless Academy lesson feed"
          href="/rss.xml"
        />
        {/* noscript */}
        <noscript>You need to enable JavaScript to run this app.</noscript>
      </NextHead>
      {/* Umami */}
      <Script
        async
        defer
        data-website-id={umamiWebsiteId}
        src={umamiDomain}
      ></Script>
    </>
  )
}

export default Head
