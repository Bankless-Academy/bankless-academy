'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { FrameContext } from '@farcaster/frame-sdk'

interface FrameContextValue {
  context: FrameContext | undefined
  isSDKLoaded: boolean
  sdk: any
}

const FrameContext = createContext<FrameContextValue | undefined>(undefined)

interface FrameProviderProps {
  children: React.ReactNode
}

export function FrameProvider({ children }: FrameProviderProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [context, setContext] = useState<FrameContext>()
  const [sdk, setSdk] = useState<any>(null)

  useEffect(() => {
    const loadSdk = async () => {
      try {
        // Only import the SDK on the client side
        if (typeof window !== 'undefined') {
          const frameSdk = await import('@farcaster/frame-sdk')
          setSdk(frameSdk.default)
          setContext(await frameSdk.default.context)
          frameSdk.default.actions.ready()
          setIsSDKLoaded(true)
        }
      } catch (error) {
        console.error('Failed to load Frame SDK:', error)
      }
    }

    if (!isSDKLoaded) {
      loadSdk()
    }
  }, [isSDKLoaded])

  // Return early during SSR
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  if (!isSDKLoaded || !sdk) {
    return null
    // return <div>Loading...</div>
  }

  return (
    <FrameContext.Provider value={{ context, isSDKLoaded, sdk }}>
      {children}
    </FrameContext.Provider>
  )
}

export function useFrame() {
  const context = useContext(FrameContext)
  if (context === undefined) {
    throw new Error('useFrame must be used within a FrameProvider')
  }
  return context
}
