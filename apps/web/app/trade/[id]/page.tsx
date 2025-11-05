'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClientSupabaseClient } from '../../../lib/supabase-client';
import { Button, Card, CardContent, LoadingSpinner, ConfirmModal, SuccessModal, useModal } from '../../../components/ui';
import { ResponsiveLayout, PageHeader, PageFooter } from '../../../components/layout';
import {
  MarketplaceItemEnriched,
  CONDITION_LABELS,
  TYPE_LABELS,
  STATUS_LABELS,
  formatPrice,
  formatLocation,
  canContactSeller,
  getStatusColor,
  getTypeIcon,
  getConditionIcon
} from '../../../types/marketplace';

export default function TradePage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientSupabaseClient();
  const [item, setItem] = useState<MarketplaceItemEnriched | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modales
  const confirmDeleteModal = useModal();
  const successModal = useModal();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Récupérer l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Récupérer l'annonce
        const { data, error: fetchError } = await supabase
          .from('marketplace_items_enriched')
          .select('*')
          .eq('id', params.id)
          .single();

        if (fetchError) {
          console.error('Error fetching trade:', fetchError);
          setError('Annonce introuvable');
          return;
        }

        // Vérifier les permissions RLS
        if (data.status !== 'available' && data.seller_id !== user?.id) {
          setError('Cette annonce n\'est pas accessible');
          return;
        }

        setItem(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, supabase]);

  const handleContactSeller = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!item || !canContactSeller(item, user.id)) {
      return;
    }

    setCreatingConversation(true);

    try {
      const { data: conversationId, error } = await supabase.rpc(
        'create_marketplace_conversation',
        {
          p_marketplace_item_id: item.id,
          p_buyer_id: user.id,
        }
      );

      if (error) {
        console.error('Error creating conversation:', error);
        alert('Erreur lors de la création de la conversation');
        return;
      }

      // Rediriger vers la conversation (adapter selon votre route de messages)
      router.push(`/messages?conversation=${conversationId}`);
    } catch (err) {
      console.error('Error:', err);
      alert('Une erreur est survenue');
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!item || !user) return;

    setIsDeleting(true);

    try {
      // Appeler la fonction de soft delete
      const { error } = await supabase.rpc('soft_delete_marketplace_item', {
        item_id: item.id
      });

      if (error) {
        console.error('Error deleting item:', error);
        alert('Erreur lors de la suppression de l\'annonce');
        return;
      }

      // Fermer la modale de confirmation
      confirmDeleteModal.close();

      // Afficher la modale de succès
      successModal.open();

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/marketplace');
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      alert('Une erreur est survenue');
    } finally {
      setIsDeleting(false);
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

  if (error || !item) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error || 'Annonce introuvable'}
              </h2>
              <p className="text-gray-600 mb-6">
                Cette annonce n'existe pas ou n'est plus disponible.
              </p>
              <Button onClick={() => router.push('/marketplace')}>
                Retour au marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  const images = item.images || [];
  const hasImages = images.length > 0;

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
        <PageHeader
          icon="🛒"
          title={item?.game_name || 'Détail de l\'annonce'}
          subtitle={item ? `${TYPE_LABELS[item.type]} • ${item.type === 'sale' ? formatPrice(item.price) : item.type === 'exchange' ? 'Échange' : 'Don'}` : ''}
          showBackButton
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Galerie photos */}
              <Card>
                <CardContent className="p-0">
                  {hasImages ? (
                    <div>
                      {/* Image principale */}
                      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                        <img
                          src={images[selectedImage]}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Miniatures */}
                      {images.length > 1 && (
                        <div className="p-4 flex gap-2 overflow-x-auto">
                          {images.map((img, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(index)}
                              className={`
                                flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                                ${selectedImage === index ? 'border-primary-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}
                              `}
                            >
                              <img
                                src={img}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-6xl mb-2">🎲</div>
                        <p>Aucune photo</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations principales */}
              <Card>
                <CardContent className="p-6">
                  {/* Badge type et status */}
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                      {getTypeIcon(item.type)} {TYPE_LABELS[item.type]}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>

                  {/* Titre */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h1>

                  {/* Prix ou jeu recherché */}
                  {item.type === 'sale' && item.price && (
                    <div className="text-4xl font-bold text-primary-600 mb-6">
                      {formatPrice(item.price)}
                    </div>
                  )}

                  {item.type === 'exchange' && item.wanted_game && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Jeu recherché :</p>
                      <p className="text-lg font-semibold text-gray-900">{item.wanted_game}</p>
                    </div>
                  )}

                  {/* Détails */}
                  <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Jeu</p>
                      <p className="font-medium text-gray-900">{item.game_name || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">État</p>
                      <p className="font-medium text-gray-900">
                        {getConditionIcon(item.condition)} {item.condition ? CONDITION_LABELS[item.condition] : 'Non spécifié'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Localisation</p>
                      <p className="font-medium text-gray-900">{formatLocation(item)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Livraison</p>
                      <p className="font-medium text-gray-900">
                        {item.delivery_available ? '✅ Possible' : '❌ Non disponible'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                      <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Colonne vendeur et actions */}
            <div className="space-y-6">
              {/* Vendeur */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendeur</h2>
                  
                  <div className="flex items-center gap-4 mb-4">
                    {item.seller_avatar ? (
                      <img
                        src={item.seller_avatar}
                        alt={item.seller_username || 'Vendeur'}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <Link
                        href={`/profile/${item.seller_username || item.seller_id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {item.seller_username || 'Utilisateur'}
                      </Link>
                      {item.seller_city && (
                        <p className="text-sm text-gray-500">📍 {item.seller_city}</p>
                      )}
                    </div>
                  </div>

                  {/* Bouton contacter */}
                  {canContactSeller(item, user?.id) && (
                    <Button
                      onClick={handleContactSeller}
                      disabled={creatingConversation}
                      className="w-full"
                    >
                      {creatingConversation ? 'Création...' : '💬 Contacter le vendeur'}
                    </Button>
                  )}

                  {/* Boutons propriétaire */}
                  {item.seller_id === user?.id && (
                    <div className="space-y-3">
                      <Button
                        onClick={() => router.push(`/create-trade?id=${item.id}`)}
                        variant="outline"
                        className="w-full"
                      >
                        ✏️ Modifier l'annonce
                      </Button>
                      <Button
                        onClick={confirmDeleteModal.open}
                        variant="destructive"
                        className="w-full"
                      >
                        🗑️ Supprimer l'annonce
                      </Button>
                      <div className="text-center py-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">C'est votre annonce</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fiche du jeu */}
              {item.game_id && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Fiche du jeu</h2>
                    
                    {item.game_photo && (
                      <img
                        src={item.game_photo}
                        alt={item.game_name || 'Jeu'}
                        className="w-full rounded-lg mb-4"
                      />
                    )}

                    <h3 className="font-medium text-gray-900 mb-2">{item.game_name}</h3>
                    
                    {(item.game_min_players || item.game_max_players) && (
                      <p className="text-sm text-gray-600 mb-4">
                        👥 {item.game_min_players || '?'}-{item.game_max_players || '?'} joueurs
                      </p>
                    )}

                    <Link href={`/games/${item.game_id}`}>
                      <Button variant="outline" className="w-full">
                        Voir la fiche du jeu
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Informations */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Informations</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Rencontrez le vendeur en lieu public</p>
                    <p>• Vérifiez l'état du jeu avant achat</p>
                    <p>• Signalez les annonces suspectes</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <PageFooter />
      </div>

      {/* Modales */}
      <ConfirmModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={confirmDeleteModal.close}
        onConfirm={handleDeleteItem}
        title="Supprimer l'annonce"
        description="Êtes-vous sûr de vouloir supprimer définitivement cette annonce ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="destructive"
        loading={isDeleting}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => {
          successModal.close();
          router.push('/marketplace');
        }}
        title="Annonce supprimée"
        description="Votre annonce a été supprimée avec succès. Vous allez être redirigé vers le marketplace."
        confirmText="OK"
      />
    </ResponsiveLayout>
  );
}

