import React from 'react'
import { Box, Button, VStack, Image, Text } from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'

import { LessonCard } from 'components/LessonCards'
import ExternalLink from 'components/ExternalLink'
import { theme } from 'theme/index'
import { useSmallScreen } from 'hooks/index'
import { LESSONS } from 'constants/index'
import InternalLink from 'components/InternalLink'

const WalletBasics = (
  account: string
): {
  isQuestCompleted: boolean
  questComponent: React.ReactElement
} => {
  const [isSmallScreen] = useSmallScreen()

  const lesson = LESSONS.find(
    (lesson) => lesson.slug === 'creating-a-crypto-wallet'
  )

  if (!lesson)
    return {
      isQuestCompleted: false,
      questComponent: <>missing handbook</>,
    }

  return {
    isQuestCompleted: !!account,
    questComponent: (
      <>
        <Box display={isSmallScreen ? 'block' : 'flex'}>
          <div className="bloc1" style={{ alignSelf: 'center' }}>
            <Box m="4">
              <Text mx="0 !important" fontSize="xl" fontWeight="bold">
                {`Create your first crypto wallet, with Zerion.`}
              </Text>
              <VStack mt="8" alignItems="start">
                <Button cursor="default" textAlign="start" height="fit-content">
                  <Box
                    padding="10px 0"
                    whiteSpace="break-spaces"
                    lineHeight="1.5em"
                  >
                    {'1. Download and install the Zerion wallet from '}
                    <ExternalLink href="https://zerion.io/">
                      zerion.io
                    </ExternalLink>
                  </Box>
                </Button>
                <Box m="0 8px 8px 16px">
                  If you already have a wallet, move to step 2.
                </Box>
                <Button
                  cursor="default"
                  textAlign="start"
                  height="fit-content"
                  rightIcon={
                    account ? <CheckIcon color={theme.colors.correct} /> : null
                  }
                >
                  <Box
                    padding="10px 0"
                    whiteSpace="break-spaces"
                    lineHeight="1.5em"
                  >
                    {'2. Connect your wallet to Bankless Academy'}
                  </Box>
                </Button>
              </VStack>
              <Box mt="8">
                {`Tip: Check our Explorer's Handbook entry on '${lesson.name}' for a step-by-step walkthrough of the quest.`}
              </Box>
            </Box>
          </div>
          <div className="bloc2" style={{ alignSelf: 'center' }}>
            <LessonCard
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
            </LessonCard>
          </div>
        </Box>
      </>
    ),
  }
}

export default WalletBasics
