# 🔧 Guide d'Application de la Migration - Compteur de Participants

## 🚨 **Problème Terminal**

Le script `fix-participants-count.sh` ne s'exécute pas correctement. Voici les solutions alternatives.

## ✅ **Solution 1 : Commande Directe**

Ouvrez un terminal dans le répertoire du projet et exécutez :

```bash
# Vérifier que vous êtes dans le bon répertoire
pwd
# Doit afficher : /Users/essykouame/Downloads/gemou2-poc

# Appliquer la migration directement
supabase db push
```

## ✅ **Solution 2 : Via le Dashboard Supabase**

### **Étape 1 : Accéder au Dashboard**
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

### **Étape 2 : Accéder à l'Éditeur SQL**
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New Query"**

### **Étape 3 : Copier et Exécuter la Migration**

Copiez le contenu suivant dans l'éditeur SQL :

```sql
-- Migration pour corriger le compteur de participants
-- Synchronise current_participants avec le nombre réel de participants

-- 1. Fonction pour mettre à jour le compteur de participants
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le compteur pour l'événement concerné
  UPDATE public.events 
  SET current_participants = (
    SELECT COUNT(*) 
    FROM public.event_participants 
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    AND status != 'cancelled'
  ),
  updated_at = timezone('utc'::text, now())
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger pour INSERT (ajout de participant)
CREATE TRIGGER trigger_update_participants_count_insert
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- 3. Trigger pour UPDATE (changement de statut)
CREATE TRIGGER trigger_update_participants_count_update
  AFTER UPDATE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- 4. Trigger pour DELETE (suppression de participant)
CREATE TRIGGER trigger_update_participants_count_delete
  AFTER DELETE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- 5. Fonction pour synchroniser tous les compteurs existants
CREATE OR REPLACE FUNCTION sync_all_event_participants_count()
RETURNS void AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = (
    SELECT COUNT(*) 
    FROM public.event_participants 
    WHERE event_participants.event_id = events.id
    AND event_participants.status != 'cancelled'
  ),
  updated_at = timezone('utc'::text, now())
  WHERE EXISTS (
    SELECT 1 FROM public.event_participants 
    WHERE event_participants.event_id = events.id
  );
END;
$$ LANGUAGE plpgsql;

-- 6. Synchroniser immédiatement tous les compteurs existants
SELECT sync_all_event_participants_count();

-- 7. Fonction helper pour obtenir le nombre réel de participants
CREATE OR REPLACE FUNCTION get_real_participants_count(event_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM public.event_participants 
    WHERE event_id = event_uuid
    AND status != 'cancelled'
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Fonction pour vérifier la cohérence des compteurs
CREATE OR REPLACE FUNCTION check_participants_count_consistency()
RETURNS TABLE(
  event_id uuid,
  event_title text,
  stored_count integer,
  real_count integer,
  is_consistent boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.current_participants,
    get_real_participants_count(e.id),
    (e.current_participants = get_real_participants_count(e.id)) as is_consistent
  FROM public.events e
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

### **Étape 4 : Exécuter la Migration**
1. Cliquez sur **"Run"** ou utilisez le raccourci `Ctrl+Enter`
2. Attendez que la migration se termine
3. Vous devriez voir un message de succès

## ✅ **Solution 3 : Vérification**

### **Tester les Fonctions Ajoutées**

Exécutez ces requêtes pour vérifier que tout fonctionne :

```sql
-- Vérifier la cohérence des compteurs
SELECT * FROM check_participants_count_consistency();

-- Synchroniser manuellement tous les compteurs
SELECT sync_all_event_participants_count();

-- Obtenir le nombre réel de participants pour un événement (remplacez l'UUID)
SELECT get_real_participants_count('your-event-uuid-here');
```

## ✅ **Solution 4 : Redémarrage du Serveur de Développement**

Après avoir appliqué la migration :

```bash
# Arrêter le serveur de développement
pkill -f "next dev"

# Redémarrer le serveur
npm run dev:web
```

## 🎯 **Résultat Attendu**

Une fois la migration appliquée, vous devriez voir :

1. **Triggers automatiques** créés sur la table `event_participants`
2. **Fonctions utilitaires** disponibles
3. **Compteurs synchronisés** automatiquement
4. **Interface utilisateur** avec le bon nombre de participants

## 🧪 **Test de Validation**

1. **Aller sur une page d'événement** : Le nombre de participants doit être exact
2. **Participer à un événement** : Le compteur doit s'incrémenter automatiquement
3. **Quitter un événement** : Le compteur doit se décrémenter automatiquement
4. **Vérifier les vignettes** : Le nombre doit être cohérent partout

## 🆘 **En Cas de Problème**

Si vous rencontrez des erreurs :

1. **Vérifiez les permissions** de votre utilisateur Supabase
2. **Vérifiez la syntaxe SQL** dans l'éditeur
3. **Exécutez les requêtes une par une** si nécessaire
4. **Contactez le support** avec les messages d'erreur

## 📞 **Support**

Si le problème persiste, fournissez :
- Le message d'erreur exact
- La méthode utilisée (CLI ou Dashboard)
- La version de Supabase CLI (si applicable)

La migration est maintenant prête à être appliquée ! 🚀

