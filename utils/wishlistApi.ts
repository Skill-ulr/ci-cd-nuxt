import type { WishlistItem } from './wishlist'
import { useRuntimeConfig } from '#app'

// Adresse du backend Hono, lue dans la configuration Nuxt
function apiUrl(): string {
  return useRuntimeConfig().public.apiBase
}

// GET : récupérer la wishlist
export async function chargerWishlistApi(
  langue: string,
): Promise<WishlistItem[]> {
  const reponse = await fetch(apiUrl() + '/wishlist', {
    // Accept-Language dit au backend dans quelle langue répondre
    headers: { 'Accept-Language': langue },
  })

  if (!reponse.ok) {
    throw new Error('Impossible de charger la wishlist')
  }

  return await reponse.json()
}

// POST : ajouter un Pokémon (le backend vérifie doublon et limite de 6)
export async function ajouterPokemonApi(
  pokemon: WishlistItem,
  langue: string,
): Promise<WishlistItem> {
  const reponse = await fetch(apiUrl() + '/wishlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': langue,
    },
    body: JSON.stringify(pokemon),
  })

  // Si le backend refuse, on récupère son message (déjà dans la bonne langue)
  if (!reponse.ok) {
    const erreur = await reponse.json()
    throw new Error(erreur.message)
  }

  return await reponse.json()
}

// DELETE : supprimer un Pokémon par son id
export async function supprimerPokemonApi(
  id: number,
  langue: string,
): Promise<void> {
  const reponse = await fetch(apiUrl() + '/wishlist/' + id, {
    method: 'DELETE',
    headers: { 'Accept-Language': langue },
  })

  if (!reponse.ok) {
    throw new Error('Impossible de supprimer le Pokémon')
  }
}
