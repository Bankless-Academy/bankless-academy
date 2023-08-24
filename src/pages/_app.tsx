import type { AppProps } from 'next/app'
import { Global, css } from '@emotion/react'
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'mac-scrollbar/dist/mac-scrollbar.css'
import 'highlight.js/styles/vs.css'
import { GlobalScrollbar } from 'mac-scrollbar'
import { isMobile } from 'react-device-detect'
import styled from '@emotion/styled'
import { Box } from '@chakra-ui/react'

import Head, { MetaData } from 'components/Head'
import Layout from 'layout'
import ThemeProvider from 'theme'
import { DEBUG } from 'utils/index'
import NonSSRWrapper from 'components/NonSSRWrapper'

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'

import { useWeb3Modal, Web3Modal } from '@web3modal/react'

import { configureChains, createConfig, WagmiConfig } from 'wagmi'

import { mainnet, optimism, polygon, polygonMumbai } from 'wagmi/chains'

const Overlay = styled(Box)`
  opacity: 1;
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100vw;
  height: 100vh;
  background: var(--chakra-colors-blackAlpha-600);
  z-index: 2;
  margin: 0;
  backdrop-filter: blur(10px);
`

const App = ({
  Component,
  pageProps,
}: AppProps<{
  pageMeta: MetaData
  isNotion: boolean
}>): JSX.Element => {
  if (
    (process.env.NEXT_PUBLIC_MAINTENANCE &&
      process.env.NEXT_PUBLIC_MAINTENANCE !== DEBUG) ||
    pageProps.pageMeta?.title === 'Maintenance'
  ) {
    return <>Maintenance in progress ...</>
  }

  const { isOpen } = useWeb3Modal()

  // https://github.com/WalletConnect/web3modal-examples/tree/main/web3modal-wagmi-react
  // https://docs.walletconnect.com/2.0/web/web3modal/react/wagmi/installation
  // 1. Get projectID at https://cloud.walletconnect.com
  const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

  const chains = [mainnet, polygon, optimism, polygonMumbai]

  // 2. Configure wagmi client
  const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, chains }),
    publicClient,
  })

  // Web3Modal Ethereum Client
  const ethereumClient = new EthereumClient(wagmiConfig, chains)

  return (
    <>
      <Head metadata={pageProps.pageMeta} />
      {!isMobile && <GlobalScrollbar skin="dark" />}
      <ThemeProvider>
        <NonSSRWrapper>
          <WagmiConfig config={wagmiConfig}>
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
                /* Disable focus border in Chakra-UI */
                *:focus {
                  box-shadow: none !important;
                }
                /* custom scrollbar color & width */
                .ms-track .ms-thumb {
                  background: #916ab8;
                }
                .ms-track.ms-y .ms-thumb {
                  width: 7px;
                }
                #chakra-toast-manager-bottom {
                  margin-bottom: 81px !important;
                }
                /* HACK: custom toast */
                .css-qret8q,
                .css-zqqgfp,
                .css-mu48c4 {
                  color: white !important;
                  border-radius: 15px !important;
                  a {
                    color: white !important;
                    text-decoration: underline;
                    text-underline-position: under;
                  }
                }
                /* success toast */
                .css-qret8q {
                  background: linear-gradient(
                    180deg,
                    #429683,
                    #35564f
                  ) !important;
                  border: 2px solid #a4d7cb !important;
                }
                /* warning toast */
                .css-zqqgfp {
                  background: linear-gradient(
                    180deg,
                    #e7b283,
                    #8e5c49
                  ) !important;
                  border: 2px solid #ffe0bb !important;
                }
                /* error toast */
                .css-mu48c4 {
                  background: linear-gradient(
                    180deg,
                    #fe7a7a,
                    #e05e55
                  ) !important;
                  border: 2px solid #f5a98d !important;
                }
                /* hide toast status logo */
                .css-14ogjxt {
                  display: none !important;
                }
                /* toast content max width for mobile */
                /* .css-cgq59l { */
                .chakra-toast > div > div > div > div > div > div > div {
                  max-width: calc(100vw - 108px);
                }
                /* menu + popover styling */
                .chakra-menu__menu-list,
                .chakra-popover__content {
                  background: linear-gradient(
                    rgba(163, 121, 189, 0.8) 0%,
                    rgba(90, 81, 152, 0.8) 100%
                  ) !important;
                  backdrop-filter: blur(10px);
                  border: 1px solid #b68bcc !important;
                }
                .chakra-menu__menuitem {
                  background: transparent !important;
                }
                .css-1slra81 {
                  background-color: var(
                    --chakra-colors-blackAlpha-500
                  ) !important;
                }
                .css-1lh2krs:focus,
                .css-18esm8n:focus {
                  background-color: var(
                    --chakra-colors-blackAlpha-300
                  ) !important;
                }
                .chakra-popover__arrow {
                  background: #86629c !important;
                  box-shadow: none !important;
                }
              `}
            />
            <Layout isLesson={pageProps.pageMeta?.isLesson || false}>
              <Component {...pageProps} />
            </Layout>
          </WagmiConfig>

          <Overlay hidden={!isOpen} />
          <Web3Modal
            projectId={projectId}
            ethereumClient={ethereumClient}
            themeMode="dark"
            themeVariables={{
              '--w3m-background-color': '#B85FF1',
              '--w3m-accent-color': '#B85FF1',
            }}
          />
        </NonSSRWrapper>
      </ThemeProvider>
    </>
  )
}

export default App
