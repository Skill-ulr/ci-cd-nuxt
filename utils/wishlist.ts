export type WishlistItem = {
  id: number
  name: string
  image: string | null
}

export function addPokemon(
  wishlist: WishlistItem[],
  pokemon: WishlistItem,
): WishlistItem[] {
  // Vérifier si le Pokémon est déjà présent
  for (let i = 0; i < wishlist.length; i++) {
    if (wishlist[i]?.id === pokemon.id) {
      return wishlist
    }
  }

  // Vérifier si la wishlist contient déjà 6 Pokémon
  if (wishlist.length >= 6) {
    return wishlist
  }

  // Ajouter le Pokémon
  return [...wishlist, pokemon]
}
