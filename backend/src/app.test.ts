
import { describe, it, expect } from 'vitest'
import { app } from './app.js'

describe('Routes PokéWishlist', () => {
  it('GET /wishlist retourne 200', async () => {
    const response = await app.request('/wishlist')

    expect(response.status).toBe(200)
  })

  it('POST /wishlist ajoute un Pokémon et retourne 201', async () => {
    const response = await app.request('/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 25,
        name: 'Pikachu'
      })
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      id: 25,
      name: 'Pikachu'
    })
  })

  it('DELETE /wishlist/:id retourne 200 quand le Pokémon existe', async () => {
    // Ajouter un Pokémon pour pouvoir le supprimer
    await app.request('/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 999,
        name: 'Testmon'
      })
    })

    const response = await app.request('/wishlist/999', {
      method: 'DELETE'
    })

    expect(response.status).toBe(200)
  })

  it('DELETE /wishlist/:id retourne 404 si le Pokémon est absent', async () => {
    const response = await app.request('/wishlist/123456', {
      method: 'DELETE'
    })

    expect(response.status).toBe(404)
  })
})
