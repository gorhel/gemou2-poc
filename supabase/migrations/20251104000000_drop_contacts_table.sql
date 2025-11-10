-- Migration : Suppression de la table contacts (non utilisée)
-- Date : 4 novembre 2025
-- Raison : La table contacts a été remplacée par la table friends
-- qui offre plus de fonctionnalités (soft delete, RPC, confidentialité)

-- Supprimer la table contacts
DROP TABLE IF EXISTS public.contacts CASCADE;

-- Commentaire pour l'historique
COMMENT ON SCHEMA public IS 'Table contacts supprimée le 2025-11-04 - Remplacée par table friends';




