import { Box, Button, useToast } from '@chakra-ui/react'
import { LessonType } from 'entities/lesson'
import { useEffect, useState } from 'react'
import { switchNetwork } from '@wagmi/core'
import { optimism } from 'wagmi/chains'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
  useNetwork,
} from 'wagmi'
import { Gear, SealCheck } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

import ExternalLink from 'components/ExternalLink'
import { useSmallScreen } from 'hooks'
import { getArticlesCollectors } from 'utils'
import { parseEther } from 'viem'
import { useLocalStorage } from 'usehooks-ts'
import Confetti from 'components/Confetti'

const CollectEntryButton = ({
  lesson,
  numberCollected,
}: {
  lesson: LessonType
  numberCollected: number | '...'
}): JSX.Element => {
  if (!lesson.mirrorNFTAddress) return
  const { t } = useTranslation()
  const { address } = useAccount()
  const { chain } = useNetwork()
  const toast = useToast()
  const [isSmallScreen] = useSmallScreen()
  const [numberMinted, setNumberMinted] = useState('-')
  const [isMinting, setIsMinting] = useState(false)
  const [mintingError, setMintingError] = useState('')
  const [, setConnectWalletPopupLS] = useLocalStorage(
    `connectWalletPopup`,
    false
  )
  const [showConfetti, setShowConfetti] = useState(false)

  const isNewContract = parseInt(lesson?.collectibleId.substring(1), 10) > 6

  const { config } = usePrepareContractWrite({
    address: lesson.mirrorNFTAddress,
    abi: isNewContract
      ? [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'tokenRecipient',
                type: 'address',
              },
              { internalType: 'string', name: 'message', type: 'string' },
              {
                internalType: 'address',
                name: 'mintReferral',
                type: 'address',
              },
            ],
            name: 'purchase',
            outputs: [
              { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            stateMutability: 'payable',
            type: 'function',
          },
        ]
      : [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'tokenRecipient',
                type: 'address',
              },
              { internalType: 'string', name: 'message', type: 'string' },
            ],
            name: 'purchase',
            outputs: [
              { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            ],
            stateMutability: 'payable',
            type: 'function',
          },
        ],
    functionName: 'purchase',
    args: isNewContract
      ? [address, '', '0x0000000000000000000000000000000000000000']
      : [address, ''],
    chainId: optimism.id,
    // 0.01 + 0.00069 in collector fee
    value: parseEther('0.01069'),
    overrides: {
      gasLimit: 150000n,
    },
    onError(error) {
      console.error('Error', error)
      setMintingError(error.message?.split('\n')[0])
    },
    onSuccess() {
      setMintingError('')
    },
  })
  const { data, write } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const updateArticlesCollectors = async () => {
    const NFTCollectors = await getArticlesCollectors(lesson.mirrorNFTAddress)
    NFTCollectors.reduce((p, c) => p + c?.tokenBalances?.length, 0)
    setNumberMinted(
      NFTCollectors.reduce(
        (p, c) => p + c?.tokenBalances?.length,
        0
      )?.toString()
    )
  }
  useEffect(() => {
    if (lesson.mirrorNFTAddress && address)
      updateArticlesCollectors().catch(console.error)
  }, [address])

  useEffect(() => {
    if (isLoading) {
      toast.closeAll()
      const txLink = `https://optimistic.etherscan.io/tx/${data?.hash}`
      toast({
        description: (
          <>
            <Box>
              <Box display="flex">
                <Box mr="4">
                  <Gear width="40px" height="auto" />
                </Box>
                <Box flexDirection="column">
                  <Box>{t('Minting in progress:')}</Box>
                  <ExternalLink
                    underline="true"
                    href={txLink}
                    alt="Etherscan transaction link"
                  >
                    {isSmallScreen ? `${txLink.substring(0, 50)}...` : txLink}
                  </ExternalLink>
                </Box>
              </Box>
            </Box>
          </>
        ),
        status: 'warning',
        duration: null,
        isClosable: true,
      })
    }
  }, [isLoading])

  useEffect(() => {
    if (isSuccess) {
      toast.closeAll()
      setShowConfetti(true)
      // HACK: guess tokenId
      const txLink = `https://opensea.io/assets/optimism/${
        lesson.mirrorNFTAddress
      }/${1 + parseInt(numberMinted)}`
      toast({
        description: (
          <>
            <Box>
              <Box display="flex">
                <Box mr="4">
                  <SealCheck width="40px" height="auto" />
                </Box>
                <Box flexDirection="column">
                  <Box>{t('Entry minted:')}</Box>
                  <ExternalLink
                    underline="true"
                    href={txLink}
                    alt="OpenSea Link"
                  >
                    {isSmallScreen ? `${txLink.substring(0, 50)}...` : txLink}
                  </ExternalLink>
                </Box>
              </Box>
            </Box>
          </>
        ),
        status: 'success',
        duration: 10000,
        isClosable: true,
      })
    }
  }, [isSuccess])

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Box>
      {lesson.areMirrorNFTAllCollected ? (
        <ExternalLink
          href={`https://opensea.io/collection/${lesson.slug}`}
          alt="Collect on secondary market"
        >
          <Button variant="primaryGold" w="100%">
            {t('Collect on secondary market')}
          </Button>
        </ExternalLink>
      ) : isSuccess ? (
        <Button
          variant="secondaryGold"
          w="100%"
          background="transparent !important"
        >
          {t('Entry Collected')}
        </Button>
      ) : (
        <Button
          isDisabled={isLoading || isMinting}
          isLoading={isLoading || isMinting}
          loadingText={isMinting ? t('Collecting Entry') : t('Minting...')}
          variant="primaryGold"
          w="100%"
          onClick={async () => {
            try {
              if (numberMinted !== '-') {
                if (parseInt(numberMinted) >= 100) {
                  openInNewTab(`https://opensea.io/collection/${lesson.slug}`)
                } else {
                  if (chain.id !== optimism.id) {
                    try {
                      await switchNetwork({ chainId: optimism.id })
                    } catch (error) {
                      console.error(error)
                    }
                    setIsMinting(false)
                    toast({
                      title: t('You were previously on the wrong network.'),
                      description: (
                        <>
                          <Box>
                            {t('Refresh the page before trying again.')}
                          </Box>
                        </>
                      ),
                      status: 'error',
                      duration: null,
                      isClosable: true,
                    })
                  } else if (!isMinting) {
                    setIsMinting(true)
                    setTimeout(() => {
                      setIsMinting(false)
                    }, 3000)
                    if (mintingError !== '') {
                      toast({
                        title: t('⚠️ Problem while minting...'),
                        description: (
                          <>
                            <Box>
                              {mintingError?.includes('exceeds the balance')
                                ? 'The total cost including gas fee exceeds your balance of ETH on Optimism.'
                                : mintingError}
                            </Box>
                            <Box>
                              {t('Refresh the page before trying again.')}
                            </Box>
                          </>
                        ),
                        status: 'error',
                        duration: null,
                        isClosable: true,
                      })
                    } else write?.()
                  }
                }
              } else if (address) alert('try again in 2 seconds')
              else setConnectWalletPopupLS(true)
            } catch (error) {
              console.error(error)
            }
          }}
        >
          <Box fontWeight="bold">Mint for 0.01 ETH</Box>
          <Box ml="2">{`(${numberCollected}/100 minted)`}</Box>
        </Button>
      )}
      <Confetti
        showConfetti={showConfetti}
        onConfettiComplete={() => {
          setShowConfetti(false)
        }}
      />
    </Box>
  )
}
export default CollectEntryButton
