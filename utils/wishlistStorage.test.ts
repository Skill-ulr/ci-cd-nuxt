import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sauvegarderWishlist, chargerWishlist } from './wishlistStorage'

describe('wishlistStorage', () => {
  let stockage: Record<string, string>

  beforeEach(() => {
    stockage = {}

    vi.stubGlobal('localStorage', {
      setItem: (cle: string, valeur: string) => {
        stockage[cle] = valeur
      },

      getItem: (cle: string) => {
        return stockage[cle] ?? null
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sauvegarde la wishlist', () => {
    const wishlist = [{ id: 25, name: 'pikachu', image: 'image.png' }]

    sauvegarderWishlist(wishlist)

    expect(stockage['wishlist']).toBe(JSON.stringify(wishlist))
  })

  it('relit la wishlist sauvegardée', () => {
    const wishlist = [{ id: 25, name: 'pikachu', image: 'image.png' }]

    stockage['wishlist'] = JSON.stringify(wishlist)

    const resultat = chargerWishlist()

    expect(resultat).toEqual(wishlist)
  })

  it('retourne une liste vide si le stockage est vide', () => {
    const resultat = chargerWishlist()

    expect(resultat).toEqual([])
  })

  it('ne plante pas si le JSON est invalide', () => {
    stockage['wishlist'] = '{ ceci est un JSON invalide'

    const resultat = chargerWishlist()

    expect(resultat).toEqual([])
  })
})
