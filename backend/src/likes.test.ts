import path from 'node:path'
import process from 'node:process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from './app.js'
import { pool } from './db.js'
import { appliquerMigrations } from './migrations.js'

describe('likes avec une vraie base PostgreSQL', () => {
  beforeAll(async () => {
    // Garde-fou : ne jamais tourner sur Supabase
    if (!process.env.DATABASE_URL?.includes('localhost')) {
      throw new Error('Les tests doivent utiliser la base locale')
    }
    // La table likes vient de la migration 001
    await appliquerMigrations(pool, path.resolve('migrations'))
  })

  beforeEach(async () => {
    await pool.query('DELETE FROM likes')
  })

  afterAll(async () => {
    await pool.end()
  })

  it('GET renvoie 0 pour un Pokémon jamais aimé', async () => {
    const reponse = await app.request('/likes/pikachu')
    expect(reponse.status).toBe(200)
    expect(await reponse.json()).toEqual({ name: 'pikachu', total: 0 })
  })

  it('POST ajoute un like puis incrémente le total', async () => {
    const premier = await app.request('/likes/pikachu', { method: 'POST' })
    expect(premier.status).toBe(201)
    expect(await premier.json()).toEqual({ name: 'pikachu', total: 1 })

    const second = await app.request('/likes/pikachu', { method: 'POST' })
    expect(await second.json()).toEqual({ name: 'pikachu', total: 2 })

    // Le total est bien écrit en base
    const ligne = await pool.query(
      'SELECT total FROM likes WHERE pokemon_name = $1',
      ['pikachu'],
    )
    expect(ligne.rows[0].total).toBe(2)
  })

  it('met le nom en minuscules', async () => {
    await app.request('/likes/PIKACHU', { method: 'POST' })
    const reponse = await app.request('/likes/pikachu')
    expect(await reponse.json()).toEqual({ name: 'pikachu', total: 1 })
  })

  it('refuse un nom invalide (400)', async () => {
    const reponse = await app.request('/likes/pika%20chu', { method: 'POST' })
    expect(reponse.status).toBe(400)
  })
})
