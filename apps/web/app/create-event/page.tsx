'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResponsiveLayout } from '../../components/layout';
import CreateEventForm from '../../components/events/CreateEventForm';
import { LoadingSpinner } from '../../components/ui/Loading';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (eventId: string) => {
    setLoading(true);
    // Rediriger vers la page de l'événement créé
    router.push(`/events/${eventId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600 text-lg">Redirection...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CreateEventForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </ResponsiveLayout>
  );
}
