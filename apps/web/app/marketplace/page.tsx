'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '../../lib/supabase-client'
import { Button, LoadingSpinner } from '../../components/ui'
import { ResponsiveLayout, PageHeader, PageFooter } from '../../components/layout'
import { MarketplaceListings } from '../../components/marketplace'

export default function MarketplacePage() {
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/login')
          return
        }

        setUser(user)
      } catch (error) {
        console.error('Error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600 text-lg">Chargement...</p>
          </div>
        </div>
      </ResponsiveLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ResponsiveLayout>
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 min-h-screen flex flex-col">
        <PageHeader
          icon="🛒"
          title="Marketplace"
          subtitle="Achetez, vendez et échangez vos jeux de société"
          actions={
            <Button onClick={() => router.push('/create-trade')} className="bg-green-600 hover:bg-green-700">
              Créer une annonce
            </Button>
          }
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-1 w-full">
          <div className="px-4 py-6 sm:px-0">
            <MarketplaceListings limit={50} />
          </div>
        </div>

        <PageFooter />
      </div>
    </ResponsiveLayout>
  )
}

