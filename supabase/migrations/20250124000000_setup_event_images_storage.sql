-- Migration pour configurer le stockage des images d'événements
-- Cette migration configure le bucket 'event-images' pour stocker les images des événements

-- Créer le bucket pour les images d'événements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre à tous les utilisateurs authentifiés d'uploader des images
CREATE POLICY "Authenticated users can upload event images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre à tous de voir les images d'événements
CREATE POLICY "Anyone can view event images" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

-- Politique pour permettre aux créateurs d'événements de supprimer leurs images
CREATE POLICY "Event creators can delete their images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Commentaire sur le bucket
COMMENT ON BUCKET event-images IS 'Stockage des images d\'événements - accessible publiquement';
