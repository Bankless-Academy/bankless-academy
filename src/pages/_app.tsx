import type { AppProps } from 'next/app'
import { Web3ReactProvider } from '@web3-react/core'
import { ethers } from 'ethers'
import 'swiper/swiper-bundle.min.css'
import Head from 'next/head'
import { Global, css } from '@emotion/react'
import { hotjar } from 'react-hotjar'

import dynamic from 'next/dynamic'
import HeadMetadata from 'components/HeadMetadata'
import Layout from 'layout'
import ThemeProvider from 'theme'

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider) // this will vary according to whether you use e.g. ethers or web3.js
}

const Web3ReactProviderDefault = dynamic(
  () => import('providers/Web3ReactProviderDefaultSSR'),
  { ssr: false }
)

const VERCEL_ENV = process.env.VERCEL_ENV
const UMAMI = process.env.UMAMI

const umamiWebsiteId =
  VERCEL_ENV === 'production' && UMAMI
    ? UMAMI
    : 'e84c3a1e-0ab0-4502-b0fe-67d660765535'
const umamiDomain = 'https://umami.bankless.community/umami.js'

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <>
      <Head>
        <script
          async
          defer
          data-website-id={umamiWebsiteId}
          src={umamiDomain}
        />
        {typeof window !== 'undefined' &&
        window.location.hostname === 'app.banklessacademy.com'
          ? hotjar.initialize(2568813, 6)
          : null}
      </Head>
      <HeadMetadata {...pageProps.pageMeta} />
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <ThemeProvider>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ReactProviderDefault getLibrary={getLibrary}>
            <Global
              styles={css`
                .web3modal-modal-lightbox {
                  background: linear-gradient(
                    152.97deg,
                    rgba(0, 0, 0, 0.45) 0%,
                    rgba(38, 38, 38, 0.25) 100%
                  );
                  backdrop-filter: blur(42px);
                }
                .web3modal-modal-card {
                  border: 1px solid #646587 !important;
                  box-shadow: 0px 0px 50px 0px rgba(123, 0, 255, 0.25) !important;
                  backdrop-filter: blur(42px) !important;
                }
              `}
            />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Web3ReactProviderDefault>
        </Web3ReactProvider>
      </ThemeProvider>
    </>
  )
}

export default App
