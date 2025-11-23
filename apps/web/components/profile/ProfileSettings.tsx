'use client'

import React, { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '../../lib/supabase-client'
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingSpinner } from '../ui'
import { UserSettings } from '../../../packages/database/types'

type TabType = 'profile' | 'privacy' | 'notifications' | 'security' | 'preferences'

interface ProfileSettingsProps {
  userId: string
  activeTab?: TabType
  onTabChange?: (tab: TabType) => void
}

export default function ProfileSettings({ 
  userId, 
  activeTab: externalTab, 
  onTabChange 
}: ProfileSettingsProps) {
  const [internalTab, setInternalTab] = useState<TabType>('profile')
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()

  const activeTab = externalTab || internalTab

  useEffect(() => {
    loadSettings()
  }, [userId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        // Si l'utilisateur n'a pas encore de settings, créer un enregistrement par défaut
        if (fetchError.code === 'PGRST116') {
          const { data: defaultData, error: insertError } = await supabase
            .from('user_settings')
            .insert({ user_id: userId })
            .select()
            .single()

          if (insertError) throw insertError
          setSettings(defaultData)
        } else {
          throw fetchError
        }
      } else {
        setSettings(data)
      }
    } catch (err: any) {
      console.error('Error loading settings:', err)
      setError(err.message || 'Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab: TabType) => {
    if (!externalTab) {
      setInternalTab(tab)
    }
    onTabChange?.(tab)
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'profile', label: 'Profil', icon: '👤' },
    { key: 'privacy', label: 'Confidentialité', icon: '🔒' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'security', label: 'Sécurité', icon: '🔐' },
    { key: 'preferences', label: 'Préférences', icon: '⚙️' }
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Paramètres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Paramètres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={loadSettings}
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>⚙️ Paramètres</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Navigation par onglets */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  transition-colors duration-200
                  ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="text-center py-8 text-gray-500">
              Section Profil - À implémenter
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="text-center py-8 text-gray-500">
              Section Confidentialité - À implémenter
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="text-center py-8 text-gray-500">
              Section Notifications - À implémenter
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="text-center py-8 text-gray-500">
              Section Sécurité - À implémenter
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div className="text-center py-8 text-gray-500">
              Section Préférences - À implémenter
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

