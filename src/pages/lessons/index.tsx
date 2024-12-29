import { GetStaticProps } from 'next'

import { MetaData } from 'components/Head'
import Layout from 'layout/Layout'
import LessonCards from 'components/LessonCards'

export const pageMeta: MetaData = {
  title: 'Lessons',
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: { pageMeta },
  }
}

function Lessons(): JSX.Element {
  return (
    <Layout page="LESSON">
      <>
        <LessonCards level="Essentials" />
        <LessonCards level="Level 1" />
        <LessonCards level="Community Lessons" />
      </>
    </Layout>
  )
}

export default Lessons
