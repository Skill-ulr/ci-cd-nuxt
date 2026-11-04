import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { app } from './app.js'
import { pool } from './db.js'

// Envoie un POST /wishlist (évite de répéter le même code dans chaque test)
async function ajouterPokemon(id: number, name: string) {
  return app.request('/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name }),
  })
}

describe('PokéWishlist avec une vraie base PostgreSQL', () => {
  // Une seule fois, avant tous les tests
  beforeAll(async () => {
    // Sécurité : on refuse de tourner sur autre chose que la base locale
    const url = process.env.DATABASE_URL || ''
    if (!url.includes('localhost')) {
      throw new Error('Les tests ne doivent tourner que sur la base locale')
    }

    // On crée la table avec le même init.sql que Supabase
    const initSql = readFileSync(
      new URL('../sql/init.sql', import.meta.url),
      'utf-8',
    )
    await pool.query(initSql)
  })

  // Avant CHAQUE test : on vide la table pour repartir de zéro (nettoyage)
  beforeEach(async () => {
    await pool.query('DELETE FROM wishlist')
  })

  // Une seule fois, après tous les tests : on ferme les connexions
  afterAll(async () => {
    await pool.end()
  })

  it('GET /wishlist retourne 200 et une liste vide au départ', async () => {
    const response = await app.request('/wishlist')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([])
  })

  it('POST /wishlist retourne 201 et le Pokémon', async () => {
    const response = await ajouterPokemon(25, 'Pikachu')

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ id: 25, name: 'Pikachu' })
  })

  it('POST /wishlist écrit vraiment dans la base', async () => {
    await ajouterPokemon(25, 'Pikachu')

    // On interroge la base directement, sans passer par l'API
    const resultat = await pool.query(
      'SELECT * FROM wishlist WHERE id = $1',
      [25],
    )

    expect(resultat.rows.length).toBe(1)
    expect(resultat.rows[0].name).toBe('Pikachu')
  })

  it('GET /wishlist retourne les Pokémon ajoutés', async () => {
    await ajouterPokemon(25, 'Pikachu')
    await ajouterPokemon(1, 'Bulbasaur')

    const response = await app.request('/wishlist')
    const liste = await response.json()

    expect(liste.length).toBe(2)
  })

  it('DELETE /wishlist/:id retourne 200 et supprime de la base', async () => {
    await ajouterPokemon(25, 'Pikachu')

    const response = await app.request('/wishlist/25', { method: 'DELETE' })
    expect(response.status).toBe(200)

    const resultat = await pool.query('SELECT * FROM wishlist')
    expect(resultat.rows.length).toBe(0)
  })

  it('DELETE /wishlist/:id retourne 404 si le Pokémon est absent', async () => {
    const response = await app.request('/wishlist/123456', { method: 'DELETE' })

    expect(response.status).toBe(404)
  })

  it('DELETE /wishlist/:id retourne 404 si id n est pas un nombre', async () => {
    const response = await app.request('/wishlist/abc', { method: 'DELETE' })

    expect(response.status).toBe(404)
  })

  it('refuse un doublon (409) et ne crée qu une ligne', async () => {
    await ajouterPokemon(25, 'Pikachu')

    const response = await ajouterPokemon(25, 'Pikachu')
    expect(response.status).toBe(409)

    const resultat = await pool.query('SELECT * FROM wishlist')
    expect(resultat.rows.length).toBe(1)
  })

  it('refuse un 7e Pokémon (limite de 6)', async () => {
    // Boucle classique : on ajoute 6 Pokémon
    for (let i = 1; i <= 6; i++) {
      await ajouterPokemon(i, 'Pokemon' + i)
    }

    const response = await ajouterPokemon(7, 'Pokemon7')
    expect(response.status).toBe(400)

    const resultat = await pool.query('SELECT * FROM wishlist')
    expect(resultat.rows.length).toBe(6)
  })

  it('refuse une entrée invalide : nom manquant (400)', async () => {
    const response = await app.request('/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 25 }),
    })

    expect(response.status).toBe(400)
  })

  it('refuse une entrée invalide : id qui n est pas un nombre (400)', async () => {
    const response = await app.request('/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'abc', name: 'Pikachu' }),
    })

    expect(response.status).toBe(400)
  })

  it('refuse un corps qui n est pas du JSON (400)', async () => {
    const response = await app.request('/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'ceci n est pas du json',
    })

    expect(response.status).toBe(400)
  })
  it('répond en français avec Accept-Language: fr', async () => {
    await ajouterPokemon(25, 'Pikachu')

    const response = await app.request('/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'fr' },
      body: JSON.stringify({ id: 25, name: 'Pikachu' }),
    })

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      message: 'Pokémon déjà dans la wishlist',
    })
  })

  it('répond en espagnol avec Accept-Language: es', async () => {
    await ajouterPokemon(25, 'Pikachu')

    const response = await app.request('/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'es' },
      body: JSON.stringify({ id: 25, name: 'Pikachu' }),
    })

    expect(await response.json()).toEqual({
      message: 'El Pokémon ya está en la lista de deseos',
    })
  })

  it('répond en anglais si la langue est inconnue (ja)', async () => {
    await ajouterPokemon(25, 'Pikachu')

    const response = await app.request('/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ja' },
      body: JSON.stringify({ id: 25, name: 'Pikachu' }),
    })

    expect(await response.json()).toEqual({
      message: 'Pokémon already in the wishlist',
    })
  })
})
