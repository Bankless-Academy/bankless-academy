import React, { useState, useEffect } from 'react'
import { Box, Spinner, Button, VStack, Image, Text } from '@chakra-ui/react'
import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useWeb3Modal } from '@web3modal/wagmi/react'

import { theme } from 'theme/index'
import { api } from 'utils/index'
import { useSmallScreen } from 'hooks/index'
import { LESSONS } from 'constants/index'
import ExternalLink from 'components/ExternalLink'

const Layer2Blockchains = (
  account: string
): {
  isQuestCompleted: boolean
  questComponent: React.ReactElement
} => {
  const [isSmallScreen] = useSmallScreen()
  const { open } = useWeb3Modal()
  const [isTransactionVerified, setIsTransactionVerified] = useState(
    localStorage.getItem('quest-layer-2-blockchains') || 'false'
  )
  const [isLoading, setIsLoading] = useState(false)

  async function openOnramp() {
    await open({ view: 'OnRampProviders' })
  }

  const validateQuest = async () => {
    try {
      setIsLoading(true)
      const result = await api('/api/validate-quest', {
        address: account,
        quest: 'Layer2Blockchains',
      })
      setIsLoading(false)
      if (result && result.status === 200) {
        setIsTransactionVerified(result?.data?.isQuestValidated?.toString())
        localStorage.setItem(
          'quest-layer-2-blockchains',
          result?.data?.isQuestValidated
        )
      } else {
        // TODO: handle errors
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (account) validateQuest()
  }, [account])

  const lesson = LESSONS.find(
    (lesson) => lesson.slug === 'funding-a-wallet-on-layer-2'
  )

  if (!lesson)
    return {
      isQuestCompleted: false,
      questComponent: <>missing handbook</>,
    }

  return {
    isQuestCompleted: isTransactionVerified === 'true',
    questComponent: (
      <>
        <Box display={isSmallScreen ? 'block' : 'flex'}>
          <div className="bloc1">
            <Box m="4">
              <Text mx="0 !important" fontSize="xl" fontWeight="bold">
                {`Begin your L2 journey on `}
                <Image
                  alt="Base"
                  src="/images/base.svg"
                  display="inline-flex"
                  height="24px"
                  m="0px 5px -5px 0"
                />
                {'Base.'}
              </Text>
              <VStack mt="8" alignItems="start">
                {/* <Button
                  cursor="default"
                  whiteSpace="break-spaces"
                  rightIcon={
                    account ? (
                      <CheckIcon color={theme.colors.correct} />
                    ) : (
                      <Spinner speed="1s" />
                    )
                  }
                >
                  {'1. Connect your wallet to Bankless Academy'}
                </Button> */}
                {/* TODO: add step later */}
                {/* <Button
                  cursor="default"
                  whiteSpace="break-spaces"
                  rightIcon={
                    isTransactionVerified === 'true' ? (
                      <CheckIcon color={theme.colors.correct} />
                    ) : isTransactionVerified === 'loading' ? (
                      <Spinner speed="1s" />
                    ) : (
                      <CloseIcon color={theme.colors.incorrect} />
                    )
                  }
                >
                  {'2. Switch to Optimism Network on Bankless Academy'}
                </Button> */}
                <Button
                  cursor="default"
                  whiteSpace="break-spaces"
                  height="auto"
                  p="16px"
                  rightIcon={
                    isTransactionVerified === 'true' ? (
                      <CheckIcon color={theme.colors.correct} />
                    ) : isLoading ? (
                      <Spinner speed="1s" />
                    ) : (
                      <CloseIcon color={theme.colors.incorrect} />
                    )
                  }
                >
                  {'Hold a balance of at least 0.0002 ETH on Base'}
                </Button>
              </VStack>
              {/* <Box mt="8">
                {`Tip: Check our Explorer's Handbook entry on 'How to Fund a Wallet on Layer 2' to find the best funding pathway for you.`}
              </Box> */}
              <Box mt="8">
                <Text mx="0 !important" fontSize="md">
                  {'Options to fund your wallet on Base:'}
                </Text>
                1.{' '}
                <Button
                  onClick={openOnramp}
                  borderRadius="3xl"
                  bg="#0052FF"
                  _hover={{
                    bg: '#0043d3',
                  }}
                  color="white"
                >
                  Onramp via Coinbase
                </Button>
                <br />
                <Box mt="2">{'👆 free withdrawal recommended'}</Box>
                <Box mt="4">
                  2.{' '}
                  <ExternalLink href={`/lessons/${lesson.slug}`}>
                    Explore other options{' '}
                    <ExternalLinkIcon mx="2px" mt="-4px" />
                  </ExternalLink>
                </Box>
              </Box>
              {isTransactionVerified !== 'true' && (
                <Box mt="24px !important" textAlign="center">
                  <Button onClick={validateQuest} variant="primary">
                    {'Check Quest'}
                  </Button>
                </Box>
              )}
            </Box>
          </div>
          {/* TODO: video demo on how to fund wallet on Base via Coinbase */}
          {/* <div className="bloc2">
            <StyledLessonCard
              borderRadius="3xl"
              maxW="400px"
              textAlign="center"
              m="auto"
            >
              <Box zIndex="2" position="relative">
                <Box py="8">
                  <Text mt="0 !important" fontSize="xl" fontWeight="bold">
                    {lesson.name}
                  </Text>
                  <InternalLink
                    href={`/lessons/${lesson.slug}`}
                    alt={lesson.englishName}
                    target="_blank"
                  >
                    <Image src={lesson.lessonImageLink} />
                  </InternalLink>
                </Box>
                <Box pb="8">
                  <InternalLink
                    href={`/lessons/${lesson.slug}`}
                    alt={lesson.englishName}
                    target="_blank"
                  >
                    <Button variant="primary">{'Read Entry'}</Button>
                  </InternalLink>
                </Box>
              </Box>
            </StyledLessonCard>
          </div> */}
        </Box>
      </>
    ),
  }
}

export default Layer2Blockchains
