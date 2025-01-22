'use client'

import { Suspense } from 'react'
import { AnalyticsContent } from './AnalyticsContent'

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsContent />
    </Suspense>
  )
} 