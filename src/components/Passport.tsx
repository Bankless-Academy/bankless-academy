/* eslint-disable no-console */
import React, { useEffect, useState } from 'react'
import { Box, Text, Button, Image, useToast } from '@chakra-ui/react'
import { useLocalStorage } from 'usehooks-ts'
import { useAccount } from 'wagmi'

import GitcoinPassport from 'components/GitcoinPassport'
import ExternalLink from 'components/ExternalLink'
import { NUMBER_OF_STAMP_REQUIRED, EMPTY_PASSPORT } from 'constants/passport'
import { theme } from 'theme/index'
import { api, shortenAddress } from 'utils'

const PassportComponent = ({
  displayStamps,
}: {
  displayStamps?: boolean
}): JSX.Element => {
  const [passportLS, setPassportLS] = useLocalStorage(
    'passport',
    EMPTY_PASSPORT
  )
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { address } = useAccount()

  useEffect(() => {
    checkPassport()
  }, [])

  async function checkPassport() {
    setIsLoading(true)
    const result = await api('/api/passport', { address })
    if (result && result.status === 200) {
      setIsLoading(false)
      // console.log('passport', result.data)
      if (result.data?.error) {
        toast.closeAll()
        if (result.data?.error.includes('ERR_BAD_RESPONSE')) {
          toast({
            title: 'Gitcoin Passport stamps not loading',
            description: (
              <ExternalLink
                underline="true"
                href="/faq#ea6ae6bd9ca645498c15cc611bc181c0"
              >
                Follow these steps and try again
              </ExternalLink>
            ),
            status: 'warning',
            duration: null,
            isClosable: true,
          })
        } else {
          toast({
            title: 'Gitcoin Passport issue',
            description: (
              <ExternalLink underline="true" href="/bug">
                Report a bug
              </ExternalLink>
            ),
            status: 'warning',
            duration: null,
            isClosable: true,
          })
        }
      }
      setPassportLS(result.data)
    } else {
      // TODO: handle errors
    }
  }

  const numberOfStampsLeftToCollect =
    NUMBER_OF_STAMP_REQUIRED - passportLS.validStampsCount

  return (
    <>
      <Box mb={6}>
        {passportLS.verified === false && passportLS?.fraud ? (
          <Box display="flex" my={2} justifyContent="center" mb={4}>
            <Box
              display="flex"
              width="80px"
              alignItems="center"
              justifyContent="center"
            >
              <Image src="/images/warning.png" height="40px" />
            </Box>
            <Text
              fontSize="xl"
              color={theme.colors.incorrect}
              fontWeight="bold"
            >
              <ExternalLink href="/faq#ea6ae6bd9ca645498c15cc611bc181c0">
                Duplicate stamp detected.
              </ExternalLink>
              <br />
              {passportLS?.fraud
                ? `Switch back to ${shortenAddress(passportLS?.fraud)}`
                : null}
            </Text>
          </Box>
        ) : (
          <Text fontSize="xl">
            <>
              {numberOfStampsLeftToCollect > 0 ? (
                <>
                  {`Visit here: `}
                  <ExternalLink href="https://passport.gitcoin.co/?filter=bankless-academy#/dashboard">
                    <Button
                      variant="primaryWhite"
                      color="#5D4E78"
                      size="lg"
                      leftIcon={
                        <Image
                          width="20px"
                          src="/images/gitcoin-passport.svg"
                          alt="Gitcoin Passport"
                        />
                      }
                    >
                      Gitcoin Passport
                    </Button>
                  </ExternalLink>
                  <Box mt="4">
                    {`Collect ${numberOfStampsLeftToCollect} more of the following stamp${
                      numberOfStampsLeftToCollect !== 1 ? 's' : ''
                    }:`}
                  </Box>
                </>
              ) : (
                'You have collected enough stamps. You can now close this popup and claim your rewards.'
              )}
            </>
          </Text>
        )}
      </Box>
      <GitcoinPassport
        stamps={passportLS ? passportLS.stamps : null}
        displayStamps={displayStamps}
      />
      <Box textAlign="center">
        <Button
          variant="outline"
          onClick={() => checkPassport()}
          isLoading={isLoading}
          loadingText="Refreshing"
          mt="4"
        >
          Refresh
        </Button>
      </Box>
    </>
  )
}

export default PassportComponent
