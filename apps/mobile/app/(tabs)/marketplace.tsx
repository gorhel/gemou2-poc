'use client'

import React from 'react'
import { PageLayout } from '../../components/layout'
import { MarketplaceList } from '../../components/marketplace'

export default function MarketplacePage() {
  return (
    <PageLayout showHeader={true}>
      <MarketplaceList limit={50} />
    </PageLayout>
  )
}
