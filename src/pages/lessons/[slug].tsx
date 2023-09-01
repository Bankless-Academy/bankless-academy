/* eslint-disable no-console */
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { Container } from '@chakra-ui/react'
import fs from 'fs'
import { useTranslation } from 'react-i18next'

import { MetaData } from 'components/Head'
import LessonDetail from 'components/LessonDetail'
import Article from 'components/Article'
import { DEFAULT_METADATA, LESSONS } from 'constants/index'
import { LessonType } from 'entities/lesson'
import { useSmallScreen } from 'hooks/index'
import { useEffect, useState } from 'react'
import { markdown } from 'utils/markdown'

const SPLIT = `\`\`\`

---`

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const currentLesson = LESSONS.find(
    (lesson: LessonType) => lesson.slug === params.slug
  )
  const translations = {}
  // console.log(currentLesson.languages)
  for (const language of currentLesson.languages) {
    // console.log(language)
    try {
      translations[language] = await fs.readFileSync(
        `translation/lesson/${language}/${currentLesson.slug}.md`,
        'utf8'
      )
    } catch (error) {
      currentLesson.languages = currentLesson.languages.filter(
        (l) => l !== language
      )
      console.log('error loading language', language)
    }
  }
  const pageMeta: MetaData = {
    title: currentLesson.name,
    description: currentLesson.description,
    image: currentLesson.socialImageLink || DEFAULT_METADATA.image,
    isLesson: !currentLesson.isArticle,
    translations: translations,
  }
  return {
    props: { pageMeta },
  }
}
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: LESSONS.map((lesson) => ({ params: { slug: lesson.slug } })),
    fallback: true,
  }
}

// TODO: move to /lesson/lesson-name + add redirect

const LessonPage = ({ pageMeta }: { pageMeta: MetaData }): JSX.Element => {
  const { i18n } = useTranslation()
  const { asPath } = useRouter()
  const router = useRouter()
  const [path] = asPath.split('?')
  const [isSmallScreen] = useSmallScreen()
  const lessons = JSON.parse(JSON.stringify(LESSONS))
  const englishLesson = lessons.find(
    (lesson: LessonType) => `/lessons/${lesson.slug}` === path
  )
  const [currentLesson, setCurrentLesson] = useState(englishLesson)

  const translationFiles = Object.keys(pageMeta?.translations || {})
  if (translationFiles && englishLesson) {
    for (const language of englishLesson.languages) {
      if (!translationFiles.includes(language)) {
        // console.log('no lang')
        englishLesson.languages = englishLesson.languages.filter(
          (l) => l !== language
        )
      }
    }
  }

  const loadMD = async (md, lang) => {
    console.log('loadMD:', lang)
    // console.log('md', md)
    if (md[0] !== '<') {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const [intro, content] = md?.split(SPLIT)
      // console.log(intro)
      const [, infos] = (intro || '').split('---')
      // console.log(infos)
      const [, title, description] = (infos || '').split('\n')
      // console.log(title)
      const newLesson = JSON.parse(JSON.stringify(englishLesson))
      newLesson.name = title.replace('TITLE: ', '')
      newLesson.description = description.replace('DESCRIPTION:', '').trim()
      // console.log(newLesson.description)
      // console.log(content)
      const slides = content?.split('# ')
      slides.shift()
      // console.log(slides)
      for (let i = 0; i < newLesson.slides.length - 1; i++) {
        // console.log(i)
        const [slide_title] = (slides[i] || '').split('\n\n')
        const slide_content = slides[i]
          .replace(slide_title, '')
          .replace(/!\[\]\(.*?\)/, ``)
          .trim()
        // console.log(slide_title)
        // console.log(slide_content)
        // console.log(quizzes)
        newLesson.slides[i].title = slide_title
        if (newLesson.slides[i].type === 'LEARN' && slide_content) {
          // console.log(slide_content)
          const rendered = await markdown.render(slide_content)
          // console.log(newLesson.slides[i].content)
          newLesson.slides[i].content = newLesson.slides[i].content.replace(
            /<div class="bloc1">.*?<\/div><div class="bloc2">/s,
            `<div class="bloc1">${rendered}</div><div class="bloc2">`
          )
        }
        if (newLesson.slides[i].type === 'QUIZ' && slide_content) {
          // console.log(slide_content)
          const [question] = slide_content.split('\n\n')
          // console.log(question)
          const answers = slide_content
            .replace(question, '')
            .replaceAll('\n>', '>')
            .replaceAll('\n\n-', '\n-')
            .trim()
          // console.log(answers)
          newLesson.slides[i].quiz.question = question
          let j = 0
          answers.split('\n').map((quiz) => {
            // console.log(quiz)
            if (quiz.length && quiz.startsWith('- [ ] ')) {
              newLesson.slides[i].quiz.answers[j] = quiz
                .replace('- [ ] ', '')
                .trim()
              j++
            } else if (quiz.length && quiz.startsWith('> ')) {
              newLesson.slides[i].quiz.feedback[j - 1] = quiz
                .replace('> ', '')
                .trim()
            }
          })
        }
      }
      console.log(`save ${lang}`)
      // console.log(newLesson)
      setCurrentLesson(newLesson)
    }
  }

  useEffect((): void => {
    if (i18n.language?.length && i18n.language in pageMeta.translations) {
      if (currentLesson && currentLesson.languages.includes(i18n.language)) {
        try {
          const md = pageMeta?.translations[i18n.language]
          if (md) loadMD(md, i18n.language)
        } catch (error) {
          console.error(error)
        }
      } else {
        console.log('language unknown')
      }
    } else {
      if (i18n.language !== 'en' && !(i18n.language in pageMeta.translations)) {
        console.log('redirect', i18n.language)
        router.push(`/lessons/${currentLesson.slug}`)
      }
      console.log('en')
      setCurrentLesson(englishLesson)
    }
  }, [i18n.language])

  if (currentLesson.name === '') {
    // force redirect to lesson select if lesson is not found
    document.location.href = '/lessons'
    return null
  } else
    return (
      <>
        {currentLesson.isArticle ? (
          <Article lesson={currentLesson} />
        ) : (
          <Container maxW="container.xl" px={isSmallScreen ? '8px' : '16px'}>
            <LessonDetail lesson={currentLesson} />
          </Container>
        )}
      </>
    )
}

export default LessonPage
