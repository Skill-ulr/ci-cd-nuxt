import { describe, it, expect } from 'vitest'
import { addPokemon, type WishlistItem } from './wishlist'

describe('addPokemon', () => {
  it('ajoute un Pokémon à la wishlist', () => {
    const wishlist: WishlistItem[] = []
    const pokemon: WishlistItem = {
      id: 1,
      name: 'bulbasaur',
      image: null
    }

    const resultat = addPokemon(wishlist, pokemon)

    expect(resultat.length).toBe(1)
    expect(resultat[0]?.name).toBe('bulbasaur')
  })

  it('refuse les doublons', () => {
    const pokemon: WishlistItem = {
      id: 1,
      name: 'bulbasaur',
      image: null
    }

    const wishlist = [pokemon]
    const resultat = addPokemon(wishlist, pokemon)

    expect(resultat.length).toBe(1)
  })

  it('refuse un ajout lorsque la wishlist contient 6 Pokémon', () => {
    const wishlist: WishlistItem[] = []

    for (let i = 1; i <= 6; i++) {
      wishlist.push({
        id: i,
        name: `pokemon-${i}`,
        image: null
      })
    }

    const nouveauPokemon: WishlistItem = {
      id: 7,
      name: 'pokemon-7',
      image: null
    }

    const resultat = addPokemon(wishlist, nouveauPokemon)

    expect(resultat.length).toBe(6)
  })
})