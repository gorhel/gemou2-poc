-- ============================================
-- Script SQL pour activer Realtime sur toutes les tables importantes
-- ============================================
-- 
-- INSTRUCTIONS :
-- 1. Copiez-collez ce script dans SQL Editor de Supabase
-- 2. Exécutez-le (bouton "Run" ou Ctrl+Enter)
-- 3. Vérifiez les résultats avec la requête de vérification en bas
--
-- NOTE : Si vous avez déjà activé certaines tables, 
--        les requêtes correspondantes seront ignorées (pas d'erreur)
-- ============================================

-- ✅ Table profiles (déjà activée si vous avez fait l'étape précédente)
-- Décommentez la ligne suivante si vous ne l'avez pas encore fait :
-- ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ✅ Table events (événements)
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- ✅ Table event_participants (participations aux événements)
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;

-- ✅ Table friends (amitiés et demandes d'amitié)
ALTER PUBLICATION supabase_realtime ADD TABLE friends;

-- ✅ Table messages (messages entre utilisateurs)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ✅ Table marketplace_items (annonces du marketplace)
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_items;

-- ============================================
-- VÉRIFICATION : Voir toutes les tables avec Realtime activé
-- ============================================
SELECT 
  schemaname,
  tablename,
  '✅ Activé' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ============================================
-- OPTIONNEL : Si vous avez d'autres tables, ajoutez-les ici
-- ============================================
-- Exemples (décommentez si vous avez ces tables) :
-- ALTER PUBLICATION supabase_realtime ADD TABLE user_games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

