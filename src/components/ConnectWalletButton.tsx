/* eslint-disable no-console */
import React, { useState, useEffect } from 'react'
import {
  Button,
  Text,
  Popover,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Box,
  Image,
  Heading,
  useDisclosure,
} from '@chakra-ui/react'
import { Wallet, Power, UserCircle } from '@phosphor-icons/react'
import axios from 'axios'
import { useLocalStorage } from 'usehooks-ts'
import styled from '@emotion/styled'
import { useRouter } from 'next/router'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'
import { getEnsName, getEnsAvatar } from '@wagmi/core'
import makeBlockie from 'ethereum-blockies-base64'
import { SiweMessage } from 'siwe'
import { useTranslation } from 'react-i18next'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { mainnet } from '@wagmi/core/chains'
import { normalize } from 'viem/ens'

// TEMP: fix https://github.com/chakra-ui/chakra-ui/issues/5896
import { PopoverTrigger as OrigPopoverTrigger } from '@chakra-ui/react'
export const PopoverTrigger: React.FC<{ children: React.ReactNode }> =
  OrigPopoverTrigger

import ExternalLink from 'components/ExternalLink'
import InternalLink from 'components/InternalLink'
import {
  DEFAULT_AVATAR,
  DEFAULT_ENS,
  IS_WALLET_DISABLED,
  SIWE_ENABLED,
} from 'constants/index'
import { BADGE_IDS } from 'constants/badges'
import { getUD, shortenAddress, api } from 'utils/index'
import { wagmiConfig } from 'utils/wagmi'

const Overlay = styled(Box)`
  opacity: 1;
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100vw;
  height: 100vh;
  background: var(--chakra-colors-blackAlpha-600);
  z-index: 1;
  backdrop-filter: blur(2px);
`

export interface Options {
  route?: 'Account' | 'ConnectWallet' | 'Help' | 'SelectNetwork'
}

const ConnectWalletButton = ({
  isSmallScreen,
}: {
  isSmallScreen: boolean
}): React.ReactElement => {
  const { t } = useTranslation()
  const { open } = useWeb3Modal()
  const { connector, isConnected } = useAccount()
  let { address } = useAccount()
  const { chainId } = useAccount()
  const { query, asPath } = useRouter()
  const { simulate } = query
  if (simulate && asPath === '/explorer/web3explorer.eth?simulate=true')
    address = '0xb00e26e79352882391604e24b371a3f3c8658e8c'
  const [waitingForSIWE, setWaitingForSIWE] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const { signMessageAsync } = useSignMessage()
  const [name, setName] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [, setBadges] = useState<number[]>([])
  const [siwe, setSiweLS] = useLocalStorage('siwe', '')
  const [connectWalletPopupLS, setConnectWalletPopupLS] = useLocalStorage(
    `connectWalletPopup`,
    false
  )
  const [nameCache, setNameCache] = useLocalStorage(`name-cache`, {})
  const [ens, setEns] = useState('')
  const [, setBadgesMintedLS] = useLocalStorage('badgesMinted', [])
  const [, setKudosMintedLS] = useLocalStorage('kudosMinted', [])
  const [refreshBadgesLS, setRefreshBadgesLS] = useLocalStorage(
    'refreshBadges',
    false
  )
  const { onOpen, onClose, isOpen } = useDisclosure()
  const { disconnect } = useDisconnect()
  // const { disconnect } = useDisconnect({
  //   onError(error) {
  //     console.log('Error while disconnecting', error)
  //   },
  //   onSuccess() {
  //     console.log('Disconnect success')
  //     // HACK: mobile wallet disconnect issues
  //     if (localStorage.getItem('wagmi.wallet').includes('walletConnect')) {
  //       console.log('force reload')
  //       location.reload()
  //     }
  //   },
  // })

  const isLessonPage = asPath.includes('/lessons')
  const isProfilePage = asPath.includes('/explorer/my-profile')

  // const networkVersion =
  //   typeof window !== 'undefined'
  //     ? (window as any).ethereum?.networkVersion
  //     : ''
  // if (networkVersion === '137') setDefaultChain(polygon)
  // if (networkVersion === '10') setDefaultChain(optimism)

  async function openModal() {
    await open({ view: 'Connect' })
  }

  async function disconnectWallet() {
    try {
      setWaitingForSIWE(false)
      setIsDisconnecting(true)
      onClose()
      setSiweLS('')
      setName(null)
      setAvatar(null)
      await fetch('/api/siwe/logout')
      setIsDisconnecting(false)
      disconnect()
    } catch (error) {
      console.error(error)
    }
  }

  async function updateName(address) {
    // console.log('updateName')
    let name = shortenAddress(address)
    let avatar = makeBlockie(address)
    const replaceName = (newName) => {
      if (name !== newName) {
        setName(newName)
        name = newName
      }
    }
    const replaceAvatar = (newAvatar) => {
      if (avatar !== newAvatar) {
        setAvatar(newAvatar)
        avatar = newAvatar
      }
    }
    const addressLower = address?.toLowerCase()
    if (nameCache[addressLower]?.name) setName(nameCache[addressLower].name)
    else setName(name)
    if (nameCache[addressLower]?.avatar)
      setAvatar(nameCache[addressLower].avatar)
    else setAvatar(avatar)

    const ensName =
      address.toLowerCase() === '0xb00e26e79352882391604e24b371a3f3c8658e8c'
        ? DEFAULT_ENS
        : await getEnsName(wagmiConfig, {
            address,
            chainId: mainnet.id,
          })
    // console.log(ensName)
    if (ensName) {
      setEns(ensName)
      replaceName(ensName)
      const ensAvatar = await getEnsAvatar(wagmiConfig, {
        name: normalize(ensName),
        chainId: mainnet.id,
      })
      // console.log(ensAvatar)
      if (ensAvatar) replaceAvatar(ensAvatar)
      if (ensName === DEFAULT_ENS) replaceAvatar(DEFAULT_AVATAR)
    } else {
      setEns('')
      const { data: lensProfile } = await api(
        `/api/lens?address=${address}`,
        {}
      )
      console.log(lensProfile)
      if (lensProfile.name) {
        replaceName(lensProfile.name)
        if (lensProfile.avatar) {
          replaceAvatar(lensProfile.avatar)
        }
      } else {
        const ud = await getUD(address)
        if (ud?.length) {
          replaceName(ud)
          replaceAvatar(
            `https://resolve.unstoppabledomains.com/image-src/${ud}`
          )
        }
      }
    }
    const newNameCache = JSON.parse(JSON.stringify(nameCache))
    newNameCache[addressLower] = { name, avatar }
    setNameCache(newNameCache)
  }

  function refreshBadges() {
    if (address)
      axios.get(`/api/user/${address}`).then((res) => {
        const score = res?.data?.stats?.score || 0
        localStorage.setItem('score', score)
        const badgeTokenIds = res?.data?.badgeTokenIds
        if (Array.isArray(badgeTokenIds)) {
          const badgesMinted = BADGE_IDS.filter((badgeId) =>
            badgeTokenIds.includes(badgeId)
          )
          // console.log(badgesMinted)
          setBadgesMintedLS(badgesMinted)
          for (const badgeId of BADGE_IDS) {
            localStorage.setItem(
              `isBadgeMinted-${badgeId.toString()}`,
              badgesMinted.includes(badgeId).toString()
            )
          }
          setBadges(badgesMinted)
        }
        const kudosTokenIds = res?.data?.kudosTokenIds
        if (Array.isArray(kudosTokenIds)) {
          setKudosMintedLS(kudosTokenIds)
        }
      })
  }

  const loadAddress = (address) => {
    setConnectWalletPopupLS(false)
    onClose()
    if (localStorage.getItem('current_wallet') !== address?.toLowerCase()) {
      localStorage.removeItem('passport')
    }
    localStorage.setItem('current_wallet', address?.toLowerCase())
    updateName(address)
    const wallets = localStorage.getItem('wallets')
      ? JSON.parse(localStorage.getItem('wallets'))
      : []
    if (!wallets.includes(address.toLowerCase())) {
      wallets.push(address.toLowerCase())
      localStorage.setItem('wallets', JSON.stringify(wallets))
    }
    refreshBadges()
  }

  const verify = async () => {
    try {
      const verifyRes = await api('/api/siwe/verify', JSON.parse(siwe))
      if (verifyRes.data.ok) {
        loadAddress(address)
      } else {
        console.error('pb SIWE signature')
        disconnectWallet()
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (siwe?.length) {
      verify()
    }
  }, [])

  const signIn = async () => {
    // console.log('signIn')
    if (!chainId || waitingForSIWE || isDisconnecting) return
    const timeout = setTimeout(() => {
      console.log('SIWE timeout')
      disconnectWallet()
    }, 60000)
    try {
      setWaitingForSIWE(true)
      const nonceRes = await fetch('/api/siwe/nonce')
      const nonce = await nonceRes.text()

      // Create SIWE message with pre-fetched nonce and sign with wallet
      // https://wagmi.sh/examples/sign-in-with-ethereum
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: t('Sign in with Ethereum to the app.'),
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      })
      await new Promise((resolve) => setTimeout(resolve, 500))
      const signature = await signMessageAsync({
        account: address,
        message: message.prepareMessage(),
      })
      clearTimeout(timeout)

      // Verify signature
      const siwe = { message, signature }
      // TODO: use /me to get verified address
      // const res = await fetch('/api/siwe/me')
      // TODO: add support for multiple windows open
      const verifyRes = await api('/api/siwe/verify', siwe)
      // https://github.com/bankless-academy/bankless-academy/pull/90/commits/d130d22e70ad146b1e619133864d03a8bf4c3cb4#diff-caedf14611e4652b0b5f0287a5bc59621a76c1d0b41c544302d3c8c1a7641d22L107
      if (!verifyRes.data.ok) throw new Error('Error verifying message')
      setSiweLS(JSON.stringify(siwe))
      loadAddress(address)
      setWaitingForSIWE(false)
    } catch (error) {
      clearTimeout(timeout)
      setWaitingForSIWE(false)
      setName(null)
      setAvatar(null)
    }
  }

  useEffect(() => {
    if (address && !SIWE_ENABLED) {
      // DO nothing
    } else {
      const { message }: any = siwe?.length ? JSON.parse(siwe) : {}
      if (connector && address && message?.address !== address) {
        signIn()
      }
    }
  }, [siwe, address, connector])

  useEffect(() => {
    if (address && !SIWE_ENABLED) {
      console.log('loadAddress', address)
      loadAddress(address)
    }
  }, [address])

  useEffect(() => {
    if (refreshBadgesLS) {
      setRefreshBadgesLS(false)
      refreshBadges()
    }
  }, [refreshBadgesLS])

  if (IS_WALLET_DISABLED) return null

  return (
    <>
      {isConnected && !waitingForSIWE && name ? (
        <Popover
          isOpen={isOpen}
          placement="bottom-end"
          returnFocusOnClose={false}
          onOpen={onOpen}
          onClose={onClose}
        >
          <PopoverTrigger>
            <Button
              variant={name ? 'secondary' : 'primary'}
              size={isSmallScreen ? 'sm' : 'md'}
              onClick={() => onOpen()}
            >
              <Box display="flex" alignItems="center">
                <Image
                  src={avatar || '/images/explorer_avatar.png'}
                  borderRadius="50%"
                  background="gray"
                  w={isSmallScreen ? '22px' : '28px'}
                  h={isSmallScreen ? '22px' : '28px'}
                  mr={isSmallScreen ? '0' : '12px'}
                />
                {isSmallScreen ? (
                  ''
                ) : (
                  <Text
                    maxW="200px"
                    display="flex"
                    alignItems="center"
                    isTruncated
                  >
                    {name || t('Click here to sign in')}
                  </Text>
                )}
                {isOpen ? <ChevronUpIcon ml="1" /> : <ChevronDownIcon ml="1" />}
              </Box>
            </Button>
          </PopoverTrigger>
          <PopoverContent width={isSmallScreen ? '260px' : '300px'}>
            <PopoverArrow />
            <PopoverBody>
              <Box textAlign="center" m="2">
                <InternalLink
                  href={`/explorer/${
                    ens?.includes('.') ? ens : address
                  }?referral=true`}
                >
                  <Button
                    w="100%"
                    size={isSmallScreen ? 'md' : 'lg'}
                    variant="primaryWhite"
                    leftIcon={<UserCircle weight="bold" />}
                    onClick={onClose}
                  >
                    {t('My Explorer Profile')}
                  </Button>
                </InternalLink>
              </Box>
              <Box textAlign="center" m="2">
                <Button
                  w="100%"
                  size={isSmallScreen ? 'md' : 'lg'}
                  variant="secondaryWhite"
                  leftIcon={<Power weight="bold" />}
                  onClick={disconnectWallet}
                >
                  {t('Disconnect Wallet')}
                </Button>
              </Box>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : (
        <Popover
          returnFocusOnClose={false}
          placement="bottom-end"
          isOpen={connectWalletPopupLS && (isLessonPage || isProfilePage)}
          onClose={() => {
            if (!isProfilePage) {
              onClose()
              setConnectWalletPopupLS(false)
            }
          }}
        >
          <Overlay
            hidden={!(connectWalletPopupLS && (isLessonPage || isProfilePage))}
            margin="0 !important"
          />
          <PopoverTrigger>
            <Button
              onClick={openModal}
              size={isSmallScreen ? 'sm' : 'md'}
              leftIcon={<Wallet weight="bold" />}
              isLoading={waitingForSIWE || isDisconnecting}
              loadingText={
                isDisconnecting
                  ? t('Disconnecting')
                  : SIWE_ENABLED
                  ? t('Sign In With Ethereum')
                  : t('Connecting wallet')
              }
              zIndex={2}
              variant={isLessonPage || isProfilePage ? 'primary' : 'secondary'}
            >
              {t('Connect Wallet')}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
              <Heading as="h2" size="md" textAlign="center" my="2">
                {t('Connect your wallet to proceed.')}
              </Heading>
              <Text textAlign="center">
                {`Don’t know how? `}
                <ExternalLink
                  underline="true"
                  href="https://app.banklessacademy.com/lessons/creating-a-crypto-wallet"
                >
                  {t('Get help here')}
                </ExternalLink>
              </Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </>
  )
}

export default ConnectWalletButton
