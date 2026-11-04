-- Table de la wishlist
-- IF NOT EXISTS : le script peut être relancé sans erreur si la table existe déjà
CREATE TABLE IF NOT EXISTS wishlist (
  -- id du Pokémon (celui de la PokéAPI, par exemple 25 pour Pikachu)
  -- PRIMARY KEY = chaque id n'existe qu'une seule fois : la base interdit les doublons
  id INTEGER PRIMARY KEY,
  -- nom du Pokémon, obligatoire
  name TEXT NOT NULL,
  -- URL de l'image, facultative (peut rester vide)
  image TEXT,
  -- date d'ajout, remplie automatiquement par la base
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sécurité : active la protection par lignes (RLS) sans aucune règle
-- Résultat : l'API publique de Supabase ne peut ni lire ni modifier cette table
-- Notre backend, lui, se connecte directement à PostgreSQL et n'est pas bloqué
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;