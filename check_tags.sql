-- Vérifier si des tags existent
SELECT COUNT(*) as total_tags FROM tags;

-- Afficher les tags existants
SELECT id, name FROM tags ORDER BY id;
