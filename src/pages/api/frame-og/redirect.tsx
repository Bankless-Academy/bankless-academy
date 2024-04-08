/* eslint-disable no-console */
import { NextApiRequest, NextApiResponse } from 'next'

import { DOMAIN_URL_ } from 'constants/index'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    lesson_slug,
    platform,
    provenance,
    explorerAddress,
    referralAddress,
  } = req.query
  console.log('referralAddress', referralAddress)
  const redirect =
    provenance === 'datadisk'
      ? `${DOMAIN_URL_}/lessons/${lesson_slug}?referral=${provenance}_${platform}`
      : explorerAddress
      ? // TODO: redirect to onboarding link + track referralAddress
        `${DOMAIN_URL_}/explorer/${explorerAddress}?referral=${provenance}_${platform}`
      : `${DOMAIN_URL_}/lessons/${lesson_slug}?referral=${provenance}_${platform}`
  return res
    .status(302)
    .setHeader('Location', redirect)
    .send('Redirecting to lesson.')
}
