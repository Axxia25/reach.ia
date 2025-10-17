'use client'

import { useState, useEffect } from 'react'

interface UseResponsiveReturn {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
  width: number
  height: number
}

export function useResponsive(): UseResponsiveReturn {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    // Set initial size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { width, height } = windowSize

  // Tailwind breakpoints
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const isDesktop = width >= 1024

  const screenSize = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    width,
    height,
  }
}

// Hook for specific breakpoint checking
export function useBreakpoint(breakpoint: number): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const checkMatch = () => {
      setMatches(window.innerWidth >= breakpoint)
    }

    // Set initial value
    checkMatch()

    const handleResize = () => checkMatch()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return matches
}

// Hook for media query matching
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}
