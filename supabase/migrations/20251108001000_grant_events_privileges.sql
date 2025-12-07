-- Migration: alignement des privilèges sur public.events
-- Date: 8 novembre 2025

BEGIN;

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;

COMMIT;




