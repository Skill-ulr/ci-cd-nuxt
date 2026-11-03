import type { WishlistItem } from './wishlist'

export async function rechercherPokemon(nom: string): Promise<WishlistItem> {
  const reponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${nom.toLowerCase()}`,
  )

  if (!reponse.ok) {
    throw new Error('Pokémon introuvable')
  }

  const data = await reponse.json()

  return {
    id: data.id,
    name: data.name,
    image: data.sprites.front_default,
  }
}
