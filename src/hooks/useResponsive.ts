'use client'

import { useState, useEffect } from 'react'

interface UseResponsiveReturn {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isXL: boolean
  is2XL: boolean
  is3XL: boolean
  is4XL: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'xl' | '2xl' | '3xl' | '4xl'
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
  const isDesktop = width >= 1024 && width < 1280
  const isXL = width >= 1280 && width < 1536
  const is2XL = width >= 1536 && width < 1920
  const is3XL = width >= 1920 && width < 2560
  const is4XL = width >= 2560

  const screenSize = is4XL ? '4xl' : 
                    is3XL ? '3xl' : 
                    is2XL ? '2xl' : 
                    isXL ? 'xl' : 
                    isDesktop ? 'desktop' : 
                    isTablet ? 'tablet' : 'mobile'

    return {
    isMobile,
    isTablet,
    isDesktop,
    isXL,
    is2XL,
    is3XL,
    is4XL,
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
