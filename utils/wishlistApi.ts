import type { WishlistItem } from './wishlist'

// Adresse du backend Hono
const API_URL = 'http://localhost:3001'

// GET : récupérer la wishlist depuis le backend
export async function chargerWishlistApi(): Promise<WishlistItem[]> {
  const reponse = await fetch(API_URL + '/wishlist')

  // reponse.ok vaut true si le statut est 200 à 299
  if (!reponse.ok) {
    throw new Error('Impossible de charger la wishlist')
  }

  return await reponse.json()
}

// POST : ajouter un Pokémon, le backend vérifie les règles (doublon, limite de 6)
export async function ajouterPokemonApi(
  pokemon: WishlistItem,
): Promise<WishlistItem> {
  const reponse = await fetch(API_URL + '/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pokemon), // transforme l'objet en texte JSON
  })

  // Si le backend refuse (409 doublon, 400 liste pleine), on récupère son message
  if (!reponse.ok) {
    const erreur = await reponse.json()
    throw new Error(erreur.message)
  }

  return await reponse.json()
}

// DELETE : supprimer un Pokémon par son id
export async function supprimerPokemonApi(id: number): Promise<void> {
  const reponse = await fetch(API_URL + '/wishlist/' + id, { method: 'DELETE' })

  if (!reponse.ok) {
    throw new Error('Impossible de supprimer le Pokémon')
  }
}
