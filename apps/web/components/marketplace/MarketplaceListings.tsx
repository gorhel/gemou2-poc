'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { LoadingSpinner } from '../ui';
import { 
  MarketplaceItemEnriched, 
  CONDITION_LABELS, 
  formatLocation,
  getConditionIcon,
  getTypeIcon 
} from '../../types/marketplace';

export interface MarketplaceListingsProps {
  limit?: number;
}

export const MarketplaceListings: React.FC<MarketplaceListingsProps> = ({ 
  limit = 6 
}) => {
  const [items, setItems] = useState<MarketplaceItemEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('marketplace_items_enriched')
          .select('*')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fetchError) {
          console.error('Error fetching marketplace items:', fetchError);
          setError('Erreur lors du chargement des annonces');
          return;
        }

        setItems(data || []);
      } catch (err) {
        console.error('Error:', err);
        setError('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [limit, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-4xl mb-3">📦</div>
        <p className="text-gray-600 mb-2">Aucune annonce disponible pour le moment</p>
        <p className="text-sm text-gray-500">Soyez le premier à publier une annonce !</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Link 
          key={item.id} 
          href={`/trade/${item.id}`}
          className="group"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 h-full">
            {/* Image */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : item.game_photo ? (
                <img
                  src={item.game_photo}
                  alt={item.game_name || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">🎲</span>
                </div>
              )}

              {/* Badge type (vente/échange) */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium shadow-sm">
                {getTypeIcon(item.type)} {item.type === 'sale' ? 'Vente' : 'Échange'}
              </div>

              {/* Prix si vente */}
              {item.type === 'sale' && item.price && (
                <div className="absolute bottom-2 left-2 px-3 py-1 bg-primary-600 text-white rounded-md font-bold text-sm shadow-lg">
                  {item.price.toFixed(2)} €
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="p-4">
              {/* Titre */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {item.title}
              </h3>

              {/* Nom du jeu */}
              {item.game_name && (
                <p className="text-sm text-gray-600 mb-2">
                  🎮 {item.game_name}
                </p>
              )}

              {/* État du jeu */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                  {getConditionIcon(item.condition)} {item.condition ? CONDITION_LABELS[item.condition] : 'État non spécifié'}
                </span>
              </div>

              {/* Localisation */}
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{formatLocation(item)}</span>
              </div>

              {/* Jeu recherché (si échange) */}
              {item.type === 'exchange' && item.wanted_game && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Recherche :</p>
                  <p className="text-sm text-gray-700 font-medium line-clamp-1">
                    {item.wanted_game}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

