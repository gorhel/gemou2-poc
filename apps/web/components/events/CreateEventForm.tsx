'use client';

import React, { useState } from 'react';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LoadingSpinner } from '../ui/Loading';
import GameSelector from './GameSelector';
import { LocationAutocomplete } from '../marketplace/LocationAutocomplete';

interface CreateEventFormProps {
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  date_time: string;
  location: string;
  max_participants: number;
  image_url?: string;
  visibility: 'public' | 'private' | 'invitation';
}

interface EventGame {
  id?: string;
  game_id?: string;
  game_name: string;
  game_thumbnail?: string;
  game_image?: string;
  year_published?: number;
  min_players?: number;
  max_players?: number;
  playing_time?: number;
  complexity?: number;
  is_custom: boolean;
  is_optional: boolean;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration?: number;
  brought_by_user_id?: string;
  notes?: string;
}

export default function CreateEventForm({ onSuccess, onCancel }: CreateEventFormProps) {
  const supabase = createClientSupabaseClient();
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date_time: '',
    location: '',
    max_participants: 4,
    image_url: '',
    visibility: 'public'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [selectedGames, setSelectedGames] = useState<EventGame[]>([]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }

    if (!formData.date_time) {
      newErrors.date_time = 'La date et heure sont obligatoires';
    } else {
      const eventDate = new Date(formData.date_time);
      const now = new Date();
      if (eventDate <= now) {
        newErrors.date_time = 'La date doit être dans le futur';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Le lieu est obligatoire';
    }

    if (formData.max_participants < 2) {
      newErrors.max_participants = 'Le nombre minimum de participants est 2';
    }

    if (formData.max_participants > 50) {
      newErrors.max_participants = 'Le nombre maximum de participants est 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof EventFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Veuillez sélectionner une image' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'L\'image doit faire moins de 5MB' }));
      return;
    }

    try {
      setLoading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setErrors(prev => ({ ...prev, image: '' }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({ ...prev, image: 'Erreur lors de l\'upload de l\'image' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Create event
      const { data: eventData, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          date_time: formData.date_time,
          location: formData.location,
          max_participants: formData.max_participants,
          image_url: formData.image_url || null,
          creator_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add creator as participant
      await supabase
        .from('event_participants')
        .insert({
          event_id: eventData.id,
          user_id: user.id,
          status: 'registered'
        });

      // Add selected games to the event
      if (selectedGames.length > 0) {
        const gamesToInsert = selectedGames.map(game => ({
          event_id: eventData.id,
          game_id: game.game_id,
          game_name: game.game_name,
          game_thumbnail: game.game_thumbnail,
          game_image: game.game_image,
          year_published: game.year_published,
          min_players: game.min_players,
          max_players: game.max_players,
          playing_time: game.playing_time,
          complexity: game.complexity,
          is_custom: game.is_custom,
          is_optional: game.is_optional,
          experience_level: game.experience_level,
          estimated_duration: game.estimated_duration,
          brought_by_user_id: game.brought_by_user_id,
          notes: game.notes
        }));

        await supabase
          .from('event_games')
          .insert(gamesToInsert);
      }

      onSuccess?.(eventData.id);
    } catch (error: any) {
      console.error('Error creating event:', error);
      setErrors({ submit: 'Erreur lors de la création de l\'événement' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showPreview) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">📅 Aperçu de l'événement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.title}</h2>
              <p className="text-gray-600">{formData.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">📅</span>
                <span>{formatDate(formData.date_time)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">📍</span>
                <span>{formData.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">👥</span>
                <span>Max {formData.max_participants} participants</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">🔒</span>
                <span>
                  {formData.visibility === 'public' && 'Public'}
                  {formData.visibility === 'private' && 'Privé'}
                  {formData.visibility === 'invitation' && 'Sur invitation'}
                </span>
              </div>
            </div>

            {formData.image_url && (
              <div className="mt-4">
                <img 
                  src={formData.image_url} 
                  alt="Image de l'événement"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Jeux sélectionnés */}
            {selectedGames.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🎮 Jeux sélectionnés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedGames.map((game, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        {game.game_thumbnail && (
                          <img
                            src={game.game_thumbnail}
                            alt={game.game_name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{game.game_name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              game.experience_level === 'beginner' ? 'bg-green-100 text-green-800' :
                              game.experience_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              game.experience_level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {game.experience_level === 'beginner' ? 'Débutant' :
                               game.experience_level === 'intermediate' ? 'Intermédiaire' :
                               game.experience_level === 'advanced' ? 'Avancé' : 'Expert'}
                            </span>
                            {game.is_optional && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Optionnel
                              </span>
                            )}
                            {game.is_custom && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Personnalisé
                              </span>
                            )}
                          </div>
                          {game.estimated_duration && (
                            <p className="text-sm text-gray-600 mt-1">
                              ⏱️ {game.estimated_duration} minutes
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
              className="flex-1"
            >
              Modifier
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Création...
                </>
              ) : (
                'Créer l\'événement'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">🎮 Créer un événement</CardTitle>
        <p className="text-gray-600 text-center">Organisez une session de jeu et invitez d'autres joueurs</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titre de l'événement *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Soirée Catan entre amis"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Décrivez votre événement, les jeux prévus, le niveau requis..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Date et heure */}
          <div>
            <label htmlFor="date_time" className="block text-sm font-medium text-gray-700 mb-2">
              Date et heure *
            </label>
            <input
              type="datetime-local"
              id="date_time"
              value={formData.date_time}
              onChange={(e) => handleInputChange('date_time', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.date_time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date_time && <p className="text-red-500 text-sm mt-1">{errors.date_time}</p>}
          </div>

          {/* Lieu */}
          <LocationAutocomplete
            label="Lieu"
            value={formData.location}
            onChange={(value) => handleInputChange('location', value)}
            required
            error={errors.location}
          />

          {/* Nombre de participants */}
          <div>
            <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre maximum de participants *
            </label>
            <input
              type="number"
              id="max_participants"
              value={formData.max_participants}
              onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value))}
              min="2"
              max="50"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.max_participants ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.max_participants && <p className="text-red-500 text-sm mt-1">{errors.max_participants}</p>}
          </div>

          {/* Visibilité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilité
            </label>
            <div className="space-y-2">
              {[
                { value: 'public', label: 'Public', description: 'Visible par tous les utilisateurs' },
                { value: 'private', label: 'Privé', description: 'Visible uniquement par vous' },
                { value: 'invitation', label: 'Sur invitation', description: 'Visible uniquement par les invités' }
              ].map((option) => (
                <label key={option.value} className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={formData.visibility === option.value}
                    onChange={(e) => handleInputChange('visibility', e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Upload d'image */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Image de l'événement (optionnel)
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            {formData.image_url && (
              <div className="mt-2">
                <img 
                  src={formData.image_url} 
                  alt="Aperçu"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Sélection de jeux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jeux qui seront joués (optionnel)
            </label>
            <GameSelector
              onGamesChange={setSelectedGames}
              initialGames={selectedGames}
            />
          </div>

          {/* Erreur générale */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            )}
            <Button
              type="button"
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="flex-1"
            >
              Aperçu
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Création...
                </>
              ) : (
                'Créer l\'événement'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
