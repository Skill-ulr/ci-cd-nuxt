// Les informations affichées sur la fiche d'un Pokémon
export type FichePokemon = {
  id: number
  name: string
  image: string | null
  height: number // en mètres
  weight: number // en kilos
  types: string[]
  abilities: string[]
}

// Récupère la fiche d'un Pokémon dans la PokéAPI
// Retourne null si le Pokémon n'existe pas (erreur 404)
export async function recupererFichePokemon(
  name: string,
): Promise<FichePokemon | null> {
  // trim enlève les espaces, toLowerCase met en minuscules (l'API veut "pikachu")
  const nomPropre = name.trim().toLowerCase()

  const reponse = await fetch(
    'https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(nomPropre),
  )

  // 404 = ce Pokémon n'existe pas : ce n'est pas une panne, on retourne null
  if (reponse.status === 404) {
    return null
  }

  // Autre erreur (serveur en panne...) : on lance une vraie erreur
  if (!reponse.ok) {
    throw new Error('Erreur PokéAPI : ' + reponse.status)
  }

  const donnees = await reponse.json()

  // On extrait seulement les noms des types
  const types: string[] = []
  for (let i = 0; i < donnees.types.length; i++) {
    types.push(donnees.types[i].type.name)
  }

  // Même chose pour les capacités
  const abilities: string[] = []
  for (let i = 0; i < donnees.abilities.length; i++) {
    abilities.push(donnees.abilities[i].ability.name)
  }

  return {
    id: donnees.id,
    name: donnees.name,
    image: donnees.sprites.front_default,
    // La PokéAPI donne la taille en décimètres et le poids en hectogrammes
    height: donnees.height / 10,
    weight: donnees.weight / 10,
    types: types,
    abilities: abilities,
  }
}
