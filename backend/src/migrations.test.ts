import path from 'node:path'
import process from 'node:process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { pool } from './db.js'
import { appliquerMigrations } from './migrations.js'

const dossier = path.resolve('migrations')

// Remet la base de test comme avant les migrations
async function reinitialiser() {
  await pool.query('DROP TABLE IF EXISTS likes')
  await pool.query('DROP TABLE IF EXISTS schema_migrations')
}

describe('migrations SQL', () => {
  beforeAll(async () => {
    // Garde-fou : ne jamais tourner sur Supabase
    if (!process.env.DATABASE_URL?.includes('localhost')) {
      throw new Error('Les tests doivent utiliser la base locale')
    }
    await reinitialiser()
  })

  afterAll(async () => {
    await pool.query('DELETE FROM wishlist')
    await pool.end()
  })

  it('applique 001_likes.sql une seule fois', async () => {
    const premiere = await appliquerMigrations(pool, dossier)
    expect(premiere).toContain('001_likes.sql')

    // Deuxième lancement : rien à faire
    const seconde = await appliquerMigrations(pool, dossier)
    expect(seconde).toEqual([])

    const resultat = await pool.query(
      'SELECT count(*)::int AS n FROM schema_migrations WHERE name = $1',
      ['001_likes.sql'],
    )
    expect(resultat.rows[0].n).toBe(1)
  })

  it('préserve les données de la wishlist', async () => {
    await pool.query('DELETE FROM wishlist')
    await pool.query(
      'INSERT INTO wishlist (id, name, image) VALUES ($1, $2, $3)',
      [25, 'pikachu', null],
    )

    // On rejoue la migration depuis zéro
    await reinitialiser()
    await appliquerMigrations(pool, dossier)

    const resultat = await pool.query('SELECT name FROM wishlist WHERE id = 25')
    expect(resultat.rows[0].name).toBe('pikachu')
  })
})
