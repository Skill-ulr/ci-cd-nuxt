import { describe, it, expect, vi, afterEach } from 'vitest'
import { rechercherPokemon } from './pokemonApi'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('rechercherPokemon', () => {
  it('retourne le Pokémon si la réponse est 200', async () => {
    const pokemonFictif = {
      id: 25,
      name: 'pikachu',
      sprites: {
        front_default: 'https://image-pikachu.png',
      },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => pokemonFictif,
      }),
    )

    const resultat = await rechercherPokemon('pikachu')

    expect(resultat.id).toBe(25)
    expect(resultat.name).toBe('pikachu')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('déclenche une erreur si la réponse est 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    )

    await expect(rechercherPokemon('pokemon-inexistant')).rejects.toThrow(
      'Pokémon introuvable',
    )
  })
})
