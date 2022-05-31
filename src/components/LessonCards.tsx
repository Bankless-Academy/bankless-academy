import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Box, Text, Tag, Image, TagRightIcon } from '@chakra-ui/react'
import styled from '@emotion/styled'
import axios from 'axios'
import { CircleWavyCheck } from 'phosphor-react'
import ReactHtmlParser from 'react-html-parser'
import { useMediaQuery } from '@chakra-ui/react'

import LESSONS from 'constants/lessons'
import LessonBanner from 'components/LessonBanner'

const LessonCard = styled(Box)`
  /* background: linear-gradient(
    152.97deg,
    rgba(0, 0, 0, 0.45) 0%,
    rgba(38, 38, 38, 0.25) 100%
  ); */
  /* backdrop-filter: blur(42px); */
`

const LessonCards: React.FC = () => {
  const [stats, setStats]: any = useState(null)

  useEffect(() => {
    axios
      .get(`/api/stats`)
      .then(function (res) {
        setStats(res.data)
      })
      .catch(function (error) {
        console.error(error)
      })
  }, [])

  return (
    <>
      {LESSONS.map((lesson, index) => {
        const [isSmallScreen] = useMediaQuery('(max-width: 800px)')
        // lesson not started yet: -1
        // const currentSlide = parseInt(localStorage.getItem(lesson.slug) || '-1')
        // const numberOfSlides = lesson.slides.length
        const isPoapClaimed = localStorage.getItem(`poap-${lesson.slug}`)
        const lessonCompleted =
          (lesson.quest && stats?.lessonCompleted[lesson.quest]) || 0
        return (
          <LessonCard
            key={`lesson-${index}`}
            p={4}
            pb={8}
            borderBottom={
              isSmallScreen && index + 1 < LESSONS.length
                ? '1px solid #72757b'
                : ''
            }
          >
            <Text fontSize="xl" fontWeight="bold">
              {lesson.name}
            </Text>
            <Text fontSize="lg">{lesson.description}</Text>
            <Box display="flex" justifyContent="space-between" my="4">
              <Tag size="sm" variant={isPoapClaimed ? 'solid' : 'outline'}>
                {isPoapClaimed ? 'Done' : `${lesson.duration} minutes`}
                {isPoapClaimed ? (
                  <TagRightIcon as={CircleWavyCheck} weight="bold" />
                ) : null}
              </Tag>
              <Text fontSize="sm">
                {lessonCompleted > 0 && `${lessonCompleted} Completions`}
              </Text>
            </Box>
            <Link href={`/lessons/${lesson.slug}`}>
              <LessonBanner
                cursor="pointer"
                // overflow="hidden"
                style={{
                  aspectRatio: '1.91/1',
                }}
                py="4"
              >
                <Image
                  // TEMP
                  style={{
                    borderRadius: 10,
                  }}
                  src={lesson.lessonImageLink}
                />
              </LessonBanner>
            </Link>
            <Text fontSize="md" mt="4">
              {ReactHtmlParser(lesson.learnings)}
            </Text>
          </LessonCard>
        )
      })}
    </>
  )
}

export default LessonCards
