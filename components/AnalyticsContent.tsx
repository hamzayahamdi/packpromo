'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackWithUTM } from '@/lib/analytics'

export function AnalyticsContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      trackWithUTM(
        'page_view',
        {
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        },
        {
          source: searchParams?.get('utm_source') || 'direct',
          medium: searchParams?.get('utm_medium') || 'none',
          campaign: searchParams?.get('utm_campaign') || 'organic',
          content: searchParams?.get('utm_content') || undefined,
          term: searchParams?.get('utm_term') || undefined,
        }
      )
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }, [searchParams])

  return null
} 