import React, { useState, useEffect } from 'react'
import { Box, Spinner, Button, VStack, Image, Text } from '@chakra-ui/react'
import { CheckIcon, CloseIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'

import { LessonCard } from 'components/LessonCards'
import { theme } from 'theme/index'
import { api } from 'utils'
import { useSmallScreen } from 'hooks'
// import InternalLink from 'components/InternalLink'
import { LESSONS } from 'constants/index'

const OptimismGovernance = (
  account: string
): {
  isQuestCompleted: boolean
  questComponent: React.ReactElement
} => {
  const { t } = useTranslation('quests', { keyPrefix: 'OptimismGovernance' })
  const [isSmallScreen] = useSmallScreen()
  const [isTransactionVerified, setIsTransactionVerified] = useState(
    localStorage.getItem('quest-optimism-governance') || 'false'
  )
  const [isLoading, setIsLoading] = useState(false)

  const validateQuest = async () => {
    try {
      setIsLoading(true)
      const result = await api('/api/validate-quest', {
        address: account,
        quest: 'OptimismGovernance',
      })
      setIsLoading(false)
      if (result && result.status === 200) {
        setIsTransactionVerified(result?.data?.isQuestValidated?.toString())
        localStorage.setItem(
          'quest-optimism-governance',
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
    (lesson) => lesson.slug === 'how-to-delegate-on-optimism'
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
            <Box ml="8">
              <Text mx="0 !important" fontSize="xl" fontWeight="bold">
                {t('Begin your Optimism Network journey by delegating OP.')}
              </Text>
              <VStack mt="8" alignItems="start">
                <Button
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
                  {t('1. Connect your wallet to Bankless Academy')}
                </Button>
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
                  {'2. Hold OP'}
                </Button> */}
                <Button
                  cursor="default"
                  whiteSpace="break-spaces"
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
                  {t('2. Delegate your vote')}
                </Button>
              </VStack>
              <Box mt="8">
                {t(
                  "Tip: Check our Explorer's Handbook entry on 'How to delegate on Optimism' to learn how to delegate."
                )}
              </Box>
              {isTransactionVerified !== 'true' && (
                <Box mt="24px !important" textAlign="center">
                  <Button onClick={validateQuest} variant="primary">
                    {t('Refresh')}
                  </Button>
                </Box>
              )}
            </Box>
          </div>
          <div className="bloc2">
            <LessonCard
              borderRadius="3xl"
              maxW="400px"
              textAlign="center"
              m="auto"
            >
              <Box
                zIndex="2"
                position="relative"
                onClick={() => alert('article not available yet')}
              >
                <Box py="8">
                  <Text mt="0 !important" fontSize="xl" fontWeight="bold">
                    {lesson.name}
                  </Text>
                  {/* <InternalLink
                    href={`/lessons/${lesson.slug}`}
                    alt={lesson.name}
                    target="_blank"
                  > */}
                  <Image src={lesson.lessonImageLink} />
                  {/* </InternalLink> */}
                </Box>
                <Box pb="8">
                  {/* <InternalLink
                    href={`/lessons/${lesson.slug}`}
                    alt={lesson.name}
                    target="_blank"
                  > */}
                  <Button variant="primary">{t('Read Entry')}</Button>
                  {/* </InternalLink> */}
                </Box>
              </Box>
            </LessonCard>
          </div>
        </Box>
      </>
    ),
  }
}

export default OptimismGovernance
