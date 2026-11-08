import fs from 'node:fs'
import path from 'node:path'
import type { Pool } from 'pg'

// Applique les fichiers .sql pas encore appliqués.
// Retourne la liste des fichiers appliqués cette fois-ci.
export async function appliquerMigrations(
  pool: Pool,
  dossier: string,
): Promise<string[]> {
  // Cette table mémorise les migrations déjà faites
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  // Pas d'accès public via l'API Supabase (comme la table wishlist)
  await pool.query('ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY')

  // Noms des migrations déjà appliquées
  const resultat = await pool.query('SELECT name FROM schema_migrations')
  const dejaAppliquees: string[] = []
  for (const ligne of resultat.rows) {
    dejaAppliquees.push(ligne.name)
  }

  // Fichiers .sql du dossier, triés par nom : 001_..., 002_...
  const fichiers = fs
    .readdirSync(dossier)
    .filter((nom) => nom.endsWith('.sql'))
    .sort()

  const appliquees: string[] = []
  for (const fichier of fichiers) {
    // Déjà fait : on passe au suivant
    if (dejaAppliquees.includes(fichier)) {
      continue
    }

    const sql = fs.readFileSync(path.join(dossier, fichier), 'utf8')

    // Une connexion dédiée pour faire une transaction
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql) // exécute le contenu du fichier
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [
        fichier,
      ])
      await client.query('COMMIT') // tout est validé d'un coup
      appliquees.push(fichier)
    } catch (erreur) {
      await client.query('ROLLBACK') // erreur : on annule tout
      throw erreur
    } finally {
      client.release() // on rend la connexion au Pool
    }
  }

  return appliquees
}
