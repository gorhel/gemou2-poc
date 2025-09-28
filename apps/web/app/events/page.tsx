'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '../../components/ui';
import { EventsList } from '../../components/events';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

export default function EventsPage() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase.auth]);

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
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ResponsiveLayout>
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🎲 Événements</h1>
                <p className="text-gray-600">Découvrez et participez aux événements de jeux de société</p>
              </div>
              <Button onClick={() => router.push('/create')} className="bg-green-600 hover:bg-green-700">
                Créer un événement
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <EventsList />
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

