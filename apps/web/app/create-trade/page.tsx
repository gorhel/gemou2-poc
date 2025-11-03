'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea, LoadingSpinner } from '../../components/ui';
import { Select } from '../../components/ui/Select';
import { Toggle } from '../../components/ui/Toggle';
import { ImageUpload } from '../../components/marketplace/ImageUpload';
import { LocationAutocomplete } from '../../components/marketplace/LocationAutocomplete';
import { GameSelect } from '../../components/marketplace/GameSelect';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import {
  CreateMarketplaceItemForm,
  MarketplaceItemType,
  MarketplaceItemCondition,
  validateMarketplaceForm,
  CONDITION_LABELS,
  TYPE_LABELS
} from '../../types/marketplace';

export default function CreateTradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const supabase = createClientSupabaseClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);

  // État du formulaire
  const [type, setType] = useState<MarketplaceItemType>('sale');
  const [title, setTitle] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);
  const [customGameName, setCustomGameName] = useState('');
  const [condition, setCondition] = useState<MarketplaceItemCondition>('good');
  const [description, setDescription] = useState('');
  const [locationQuarter, setLocationQuarter] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [wantedGame, setWantedGame] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Si mode édition, charger les données de l'annonce
        if (editId) {
          await loadTradeData(editId, user.id);
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router, supabase.auth, editId]);

  const loadTradeData = async (tradeId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (error) {
        console.error('Error loading trade:', error);
        setErrors({ general: 'Impossible de charger l\'annonce' });
        return;
      }

      // Vérifier que l'utilisateur est bien le propriétaire
      if (data.seller_id !== userId) {
        setErrors({ general: 'Vous n\'êtes pas autorisé à modifier cette annonce' });
        return;
      }

      // Pré-remplir le formulaire
      setIsEditMode(true);
      setType(data.type || 'sale');
      setTitle(data.title || '');
      setGameId(data.game_id);
      setCustomGameName(data.custom_game_name || '');
      setCondition(data.condition || 'good');
      setDescription(data.description || '');
      setLocationQuarter(data.location_quarter || '');
      setLocationCity(data.location_city || '');
      setImages(data.images || []);
      setPrice(data.price);
      setWantedGame(data.wanted_game || '');
      setDeliveryAvailable(data.delivery_available || false);
    } catch (error) {
      console.error('Error:', error);
      setErrors({ general: 'Une erreur est survenue lors du chargement' });
    }
  };

  const handleLocationChange = (value: string, quarter?: string, city?: string) => {
    if (quarter && city) {
      setLocationQuarter(quarter);
      setLocationCity(city);
    } else if (city && !quarter) {
      setLocationQuarter('');
      setLocationCity(city);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!user) return;

    setErrors({});
    setSubmitting(true);

    const formData: CreateMarketplaceItemForm = {
      title: title.trim(),
      description: description.trim() || undefined,
      condition,
      type,
      game_id: gameId || null,
      custom_game_name: customGameName.trim() || null,
      price: type === 'sale' ? price : null,
      wanted_game: type === 'exchange' ? wantedGame.trim() : null,
      location_quarter: locationQuarter || undefined,
      location_city: locationCity || undefined,
      delivery_available: deliveryAvailable,
      images,
      status: isDraft ? 'draft' : 'available',
    };

    // Valider uniquement si on publie
    if (!isDraft) {
      const { valid, errors: validationErrors } = validateMarketplaceForm(formData);

      if (!valid) {
        const errorMap: Record<string, string> = {};
        validationErrors.forEach((err) => {
          if (err.includes('titre')) errorMap.title = err;
          else if (err.includes('jeu')) errorMap.game = err;
          else if (err.includes('état')) errorMap.condition = err;
          else if (err.includes('prix')) errorMap.price = err;
          else if (err.includes('recherché')) errorMap.wantedGame = err;
          else errorMap.general = err;
        });
        setErrors(errorMap);
        setSubmitting(false);
        return;
      }
    }

    try {
      if (isEditMode && editId) {
        // Mode édition : UPDATE
        const { data, error } = await supabase
          .from('marketplace_items')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId)
          .eq('seller_id', user.id) // Sécurité supplémentaire
          .select()
          .single();

        if (error) {
          console.error('Error updating trade:', error);
          setErrors({ general: 'Erreur lors de la mise à jour de l\'annonce' });
          return;
        }

        // Rediriger vers l'annonce modifiée
        router.push(`/trade/${data.id}`);
      } else {
        // Mode création : INSERT
        const { data, error } = await supabase
          .from('marketplace_items')
          .insert({
            ...formData,
            seller_id: user.id,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating trade:', error);
          setErrors({ general: 'Erreur lors de la création de l\'annonce' });
          return;
        }

        // Rediriger vers l'annonce créée
        router.push(`/trade/${data.id}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ general: 'Une erreur est survenue' });
    } finally {
      setSubmitting(false);
    }
  };

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

  const conditionOptions = Object.entries(CONDITION_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-primary-600 hover:text-primary-700 flex items-center mb-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Modifier l\'annonce' : 'Créer une annonce'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditMode ? 'Modifiez les informations de votre annonce' : 'Vendez ou échangez vos jeux de société'}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form className="space-y-6">
                {/* Erreur générale */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                {/* Toggle Type de Transaction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type de transaction
                  </label>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setType('sale')}
                      className={`
                        flex-1 px-6 py-3 rounded-lg font-medium transition-colors
                        ${type === 'sale'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      💰 {TYPE_LABELS.sale}
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('exchange')}
                      className={`
                        flex-1 px-6 py-3 rounded-lg font-medium transition-colors
                        ${type === 'exchange'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      🔄 {TYPE_LABELS.exchange}
                    </button>
                  </div>
                </div>

                {/* Titre */}
                <Input
                  label="Titre de l'annonce"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Catan - Extension Marins"
                  required
                  fullWidth
                  error={errors.title}
                />

                {/* Jeu */}
                <GameSelect
                  label="Identification du jeu"
                  value={gameId}
                  customGameName={customGameName}
                  onGameSelect={(id, name) => {
                    setGameId(id);
                    setCustomGameName(name);
                  }}
                  required
                  error={errors.game}
                />

                {/* État */}
                <Select
                  label="État du jeu"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as MarketplaceItemCondition)}
                  options={conditionOptions}
                  required
                  fullWidth
                  error={errors.condition}
                />

                {/* Description */}
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez l'état du jeu, ce qui est inclus, etc."
                  rows={4}
                  fullWidth
                />

                {/* Localisation */}
                <LocationAutocomplete
                  label="Localisation"
                  value={locationCity ? `${locationQuarter ? locationQuarter + ', ' : ''}${locationCity}` : ''}
                  onChange={handleLocationChange}
                />

                {/* Photos */}
                <ImageUpload
                  images={images}
                  onChange={setImages}
                  maxImages={5}
                />

                {/* Prix (si vente) */}
                {type === 'sale' && (
                  <Input
                    label="Prix (€)"
                    type="number"
                    value={price || ''}
                    onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="25.00"
                    required
                    fullWidth
                    error={errors.price}
                    min="0"
                    step="0.01"
                  />
                )}

                {/* Jeu recherché (si échange) */}
                {type === 'exchange' && (
                  <Input
                    label="Jeu recherché"
                    value={wantedGame}
                    onChange={(e) => setWantedGame(e.target.value)}
                    placeholder="Ex: Wingspan ou Terraforming Mars"
                    required
                    fullWidth
                    error={errors.wantedGame}
                  />
                )}

                {/* Livraison */}
                <div className="pt-4 border-t border-gray-200">
                  <Toggle
                    checked={deliveryAvailable}
                    onChange={setDeliveryAvailable}
                    label="Livraison possible"
                  />
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit(true)}
                    disabled={submitting || !title.trim()}
                    className="flex-1"
                  >
                    {submitting ? 'Enregistrement...' : 'Enregistrer et quitter'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting 
                      ? (isEditMode ? 'Mise à jour...' : 'Publication...') 
                      : (isEditMode ? 'Mettre à jour' : 'Publier')
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

