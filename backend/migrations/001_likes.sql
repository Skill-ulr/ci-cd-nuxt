-- Migration 001 : compteur de likes par Pokémon
CREATE TABLE likes (
  pokemon_name TEXT PRIMARY KEY,
  total INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0)
);

-- Comme wishlist : le backend se connecte directement à PostgreSQL
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
