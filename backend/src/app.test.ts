import { describe, it, expect, beforeEach } from 'vitest'
import { app, resetWishlist } from './app.js'

// Petite fonction pour éviter de répéter le même code dans chaque test
async function ajouterPokemon(id: number, name: string) {
  return app.request('/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name }),
  })
}

describe('Routes PokéWishlist', () => {
  // Avant chaque test, on vide la wishlist pour que les tests ne s'influencent pas
  beforeEach(() => {
    resetWishlist()
  })

  it('GET /wishlist retourne 200 et un tableau', async () => {
    const response = await app.request('/wishlist')

    expect(response.status).toBe(200)
    expect(Array.isArray(await response.json())).toBe(true)
  })

  it('POST /wishlist ajoute un Pokémon et retourne 201', async () => {
    const response = await ajouterPokemon(25, 'Pikachu')

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ id: 25, name: 'Pikachu' })
  })

  it('DELETE /wishlist/:id retourne 200 quand le Pokémon existe', async () => {
    await ajouterPokemon(999, 'Testmon')

    const response = await app.request('/wishlist/999', { method: 'DELETE' })

    expect(response.status).toBe(200)
  })

  it('DELETE /wishlist/:id retourne 404 si le Pokémon est absent', async () => {
    const response = await app.request('/wishlist/123456', { method: 'DELETE' })

    expect(response.status).toBe(404)
  })
})

describe('Règles métier PokéWishlist', () => {
  beforeEach(() => {
    resetWishlist()
  })

  it('refuse un doublon (409)', async () => {
    await ajouterPokemon(25, 'Pikachu')

    const response = await ajouterPokemon(25, 'Pikachu')

    expect(response.status).toBe(409)
  })

  it('refuse un 7e Pokémon (limite de 6)', async () => {
    // On ajoute 6 Pokémon avec une boucle classique
    for (let i = 1; i <= 6; i++) {
      await ajouterPokemon(i, 'Pokemon' + i)
    }

    const response = await ajouterPokemon(7, 'Pokemon7')

    expect(response.status).toBe(400)
  })

  it('refuse une entrée invalide : nom manquant (400)', async () => {
    const response = await app.request('/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 25 }), // pas de "name"
    })

    expect(response.status).toBe(400)
  })

  it("refuse une entrée invalide : id qui n'est pas un nombre (400)", async () => {
    const response = await app.request('/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'abc', name: 'Pikachu' }),
    })

    expect(response.status).toBe(400)
  })

  it('supprime vraiment le Pokémon de la liste', async () => {
    await ajouterPokemon(25, 'Pikachu')
    await app.request('/wishlist/25', { method: 'DELETE' })

    // On relit la liste : elle doit être vide
    const response = await app.request('/wishlist')

    expect(await response.json()).toEqual([])
  })
})
