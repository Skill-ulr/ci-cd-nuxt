import { useRuntimeConfig } from '#app'

// Adresse du backend, lue dans la configuration Nuxt
function apiUrl(): string {
  return useRuntimeConfig().public.apiBase
}

// GET : nombre de likes d'un Pokémon
export async function chargerLikesApi(name: string): Promise<number> {
  const reponse = await fetch(apiUrl() + '/likes/' + name)
  if (!reponse.ok) {
    throw new Error('Impossible de charger les likes')
  }
  const donnees = await reponse.json()
  return donnees.total
}

// POST : ajouter un like, le backend renvoie le nouveau total
export async function ajouterLikeApi(name: string): Promise<number> {
  const reponse = await fetch(apiUrl() + '/likes/' + name, { method: 'POST' })
  if (!reponse.ok) {
    throw new Error('Impossible d ajouter le like')
  }
  const donnees = await reponse.json()
  return donnees.total
}
