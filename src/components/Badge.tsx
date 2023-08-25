/* eslint-disable no-console */
import { Box, Button, Image as ChakraImage } from '@chakra-ui/react'
import { useLocalStorage } from 'usehooks-ts'

import { LessonType } from 'entities/lesson'
import MintBadge from 'components/MintBadge'
import { IS_WHITELABEL, TWITTER_ACCOUNT, DOMAIN_URL } from 'constants/index'
import { BADGE_OPENSEA_URL } from 'constants/badges'
import ExternalLink from 'components/ExternalLink'
import Helper from 'components/Helper'
import NFT from 'components/NFT'
import { BADGE_TO_KUDOS_IDS } from 'pages/api/badges/[...slug]'

const BadgeHelper = (
  <Helper
    title="Academy Badges"
    definition={
      <>
        <Box>
          Academy Badges are non-tradable NFTs that serve as proof of your
          achievements on the blockchain. You can mint them for free after you
          answered all the questions correctly and validated the lesson quest.
        </Box>
      </>
    }
  />
)

const Badge = ({
  lesson,
  isQuestCompleted,
}: {
  lesson: LessonType
  isQuestCompleted: boolean
}): JSX.Element => {
  const [isBadgeMintedLS] = useLocalStorage(
    `isBadgeMinted-${lesson.badgeId}`,
    false
  )
  const [kudosMintedLS] = useLocalStorage(`kudosMinted`, [])
  const share = `I've just claimed my "${
    lesson.name
  }" on-chain credential at @${TWITTER_ACCOUNT} 🎉
${
  IS_WHITELABEL
    ? `${DOMAIN_URL}/lessons/${lesson.slug}`
    : `${DOMAIN_URL}/lessons/${lesson.slug}

Join the journey and level up your #web3 knowledge! 👨‍🚀🚀`
}`

  const twitterLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    share
  )}`

  if (!isQuestCompleted && !isBadgeMintedLS) {
    return (
      <Box position="relative" w="290px" m="auto" my="6">
        <Box
          border="1px solid #4b474b"
          borderRadius="8px"
          overflow="hidden"
          opacity="0.5"
        >
          <NFT nftLink={lesson.badgeImageLink} />
        </Box>
        {BadgeHelper}
      </Box>
    )
  }

  const kudosId = BADGE_TO_KUDOS_IDS[lesson.badgeId.toString()]
  const OpenSeaBadgeLink = kudosMintedLS.includes(kudosId)
    ? // old badges (kudos)
      `https://opensea.io/assets/matic/0x60576a64851c5b42e8c57e3e4a5cf3cf4eeb2ed6/${kudosId}`
    : // new badges
      `${BADGE_OPENSEA_URL}${lesson.badgeId}`

  return (
    <>
      <Box textAlign="center" mb="40px">
        <Box width="290px" m="auto">
          {isBadgeMintedLS ? (
            <Box border="1px solid #9E72DC" borderTopRadius="8px" py="3" px="5">
              <Box color="#9E72DC" fontWeight="bold" fontSize="lg">
                Badge Minted
              </Box>
            </Box>
          ) : (
            <Box position="relative">
              <MintBadge badgeId={lesson.badgeId} />
              {BadgeHelper}
            </Box>
          )}
          <Box
            width="290px"
            borderRadius={
              isBadgeMintedLS
                ? '0px'
                : !isQuestCompleted
                ? '8px'
                : '0px 0px 8px 8px'
            }
            overflow="hidden"
            border="1px solid #4b474b"
          >
            <NFT nftLink={lesson.badgeImageLink} />
          </Box>
          {isBadgeMintedLS && (
            <Box
              // display="flex"
              justifyContent="center"
              borderRadius="0px 0px 8px 8px"
              border="1px solid #4b474b"
              borderTop="0"
              p="4"
            >
              <Box pb="2">
                <ExternalLink href={twitterLink} mr="2">
                  <Button
                    variant="primary"
                    w="100%"
                    borderBottomRadius="0"
                    leftIcon={
                      <ChakraImage width="24px" src="/images/Twitter.svg" />
                    }
                  >
                    Share on Twitter
                  </Button>
                </ExternalLink>
              </Box>
              <ExternalLink href={OpenSeaBadgeLink}>
                <Button
                  variant="primary"
                  w="100%"
                  borderTopRadius="0"
                  leftIcon={
                    <ChakraImage width="24px" src="/images/OpenSea.svg" />
                  }
                >
                  View on OpenSea
                </Button>
              </ExternalLink>
            </Box>
          )}
        </Box>
      </Box>
    </>
  )
}

export default Badge
