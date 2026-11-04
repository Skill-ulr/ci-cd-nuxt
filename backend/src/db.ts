import pg from 'pg'

const databaseUrl = process.env.DATABASE_URL

// Si l'adresse de la base est absente, on s'arrête avec un message clair
if (!databaseUrl) {
  throw new Error('DATABASE_URL manquante : ajoute-la dans backend/.env')
}

// "pg" est un ancien format de module : on récupère Pool comme ceci
const { Pool } = pg

// Par défaut (Supabase), connexion chiffrée SSL.
// rejectUnauthorized: false accepte son certificat : suffisant pour ce TP
let ssl: false | { rejectUnauthorized: boolean } = { rejectUnauthorized: false }

// Base locale (tests) : pas de SSL
if (databaseUrl.includes('localhost')) {
  ssl = false
}

// Un Pool garde plusieurs connexions ouvertes vers la base et les réutilise
export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: ssl,
})
