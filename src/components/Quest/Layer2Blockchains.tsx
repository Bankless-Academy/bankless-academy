import React, { useState, useEffect } from 'react'
import { Box, Spinner, Button, VStack, Image, Text } from '@chakra-ui/react'
import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons'

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
  const [isTransactionVerified, setIsTransactionVerified] = useState(
    localStorage.getItem('quest-layer-2-blockchains') || 'false'
  )
  const [isLoading, setIsLoading] = useState(false)

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
                      <Spinner size="sm" speed="1s" />
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
                  as="a"
                  cursor="pointer"
                  onClick={() =>
                    window.open(
                      `https://pay.coinbase.com/buy/select-asset?appId=bf18c88d-495a-463b-b249-0b9d3656cf5e&destinationWallets=%5B%7B%22address%22%3A%22${account}%22%2C%22blockchains%22%3A%5B%22optimism%22%2C%22base%22%5D%2C%22assets%22%3A%5B%5D%7D%5D&partnerUserId=0xe1887fF140BfA9D3b45D0B2077b7471124acD242&defaultNetwork=base&defaultExperience=send`,
                      '_blank',
                      'width=470,height=750'
                    )
                  }
                  borderRadius="3xl"
                  bg="#0052FF"
                  _hover={{
                    bg: '#0043d3',
                    color: 'white !important',
                  }}
                  color="white !important"
                >
                  Onramp via Coinbase
                </Button>
                <br />
                <Box mt="2" ml="5">
                  {'👆 free withdrawal recommended'}
                </Box>
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
