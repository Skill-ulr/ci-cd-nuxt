import { describe, it, expect, vi, afterEach } from 'vitest'
import { recupererFichePokemon } from './pokemonDetails'

// Après chaque test, on remet le vrai fetch
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('recupererFichePokemon', () => {
  it('retourne la fiche formatée', async () => {
    // Fausse réponse de la PokéAPI (le test ne dépend pas d'internet)
    const fauxPikachu = {
      ok: true,
      status: 200,
      json: async () => ({
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        sprites: { front_default: 'https://image/pikachu.png' },
        types: [{ type: { name: 'electric' } }],
        abilities: [{ ability: { name: 'static' } }],
      }),
    }
    // vi.fn() crée un faux fetch qui renvoie toujours fauxPikachu
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fauxPikachu))

    const fiche = await recupererFichePokemon('Pikachu')

    expect(fiche).toEqual({
      id: 25,
      name: 'pikachu',
      image: 'https://image/pikachu.png',
      height: 0.4,
      weight: 6,
      types: ['electric'],
      abilities: ['static'],
    })
  })

  it('retourne null si le Pokémon n existe pas (404)', async () => {
    const faux404 = { ok: false, status: 404 }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(faux404))

    const fiche = await recupererFichePokemon('nimportequoi')

    expect(fiche).toBeNull()
  })

  it('lance une erreur si la PokéAPI est en panne (500)', async () => {
    const faux500 = { ok: false, status: 500 }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(faux500))

    // rejects.toThrow vérifie que la fonction lance bien une erreur
    await expect(recupererFichePokemon('pikachu')).rejects.toThrow()
  })
})
