/* eslint-disable no-console */
import NextAuth, { NextAuthOptions } from "next-auth"
import credentialsProvider from 'next-auth/providers/credentials'
import {
  type SIWESession,
  getChainIdFromMessage,
  getAddressFromMessage
} from '@web3modal/siwe'
import { verifySignature } from "utils/SignatureUtil"

declare module 'next-auth' {
  interface Session extends SIWESession {
    address: string
    chainId: number
  }
}

const nextAuthSecret = process.env.NEXTAUTH_SECRET
if (!nextAuthSecret) {
  throw new Error('NEXTAUTH_SECRET is not set')
}

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set')
}

const providers = [
  credentialsProvider({
    name: 'Ethereum',
    credentials: {
      message: {
        label: 'Message',
        type: 'text',
        placeholder: '0x0'
      },
      signature: {
        label: 'Signature',
        type: 'text',
        placeholder: '0x0'
      }
    },
    async authorize(credentials) {
      try {
        if (!credentials?.message) {
          throw new Error('SiweMessage is undefined')
        }
        const { message, signature } = credentials
        const address = getAddressFromMessage(message)
        const chainId = getChainIdFromMessage(message)
        console.log('address', address)
        console.log('message', message)
        console.log('signature', signature)
        console.log('chainId', chainId)
        console.log('projectId', projectId)

        const isValid = await verifySignature({ address, message, signature, chainId: Number(chainId.split(':')[1]) })

        if (isValid) {
          return {
            id: `${chainId}:${address}`
          }
        }

        return null
      } catch (e) {
        console.error(e)
        return null
      }
    }
  })
]

export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  secret: nextAuthSecret,
  providers,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    session({ session, token }) {
      if (!token.sub) {
        return session
      }

      const [, chainId, address] = token.sub.split(':')
      if (chainId && address) {
        session.address = address
        session.chainId = parseInt(chainId, 10)
      }

      return session
    },
    // redirect({ url, baseUrl }) {
    //   console.log('url', url)
    //   console.log('baseUrl', baseUrl)
    //   return baseUrl
    // },
  }
}

export default NextAuth(authOptions)
