import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Pokemon = {
  id: number
  name: string
  image?: string | null // le ? veut dire "champ facultatif"
}

const app = new Hono()

// Autorise le frontend (autre port) à appeler cette API
// Sans paramètre, cors() accepte toutes les origines : suffisant pour ce TP
app.use('/*', cors())

// Limite de Pokémon dans la wishlist (règle métier)
const MAX_POKEMON = 6

// Tableau temporaire en mémoire
const wishlist: Pokemon[] = []

// Vide la wishlist : utile pour repartir de zéro dans chaque test
function resetWishlist() {
  wishlist.length = 0 // mettre length à 0 vide le tableau sans le recréer
}

app.get('/wishlist', (c) => {
  return c.json(wishlist, 200)
})

app.post('/wishlist', async (c) => {
  let pokemon: Pokemon

  // Si le corps de la requête n'est pas du JSON valide, on renvoie 400
  try {
    pokemon = await c.req.json<Pokemon>()
  } catch {
    return c.json({ message: 'JSON invalide' }, 400)
  }

  // Règle 1 : entrée invalide (id doit être un nombre, name un texte non vide)
  if (
    !pokemon ||
    typeof pokemon.id !== 'number' ||
    typeof pokemon.name !== 'string' ||
    pokemon.name.trim() === ''
  ) {
    return c.json({ message: 'Pokémon invalide' }, 400)
  }

  // Règle 2 : pas de doublon (même id déjà présent)
  const dejaPresent = wishlist.some((p) => p.id === pokemon.id)
  if (dejaPresent) {
    return c.json({ message: 'Pokémon déjà dans la wishlist' }, 409)
  }

  // Règle 3 : maximum 6 Pokémon
  if (wishlist.length >= MAX_POKEMON) {
    return c.json({ message: 'Wishlist pleine (6 maximum)' }, 400)
  }

  wishlist.push(pokemon)
  return c.json(pokemon, 201)
})

app.delete('/wishlist/:id', (c) => {
  const id = Number(c.req.param('id'))
  const index = wishlist.findIndex((pokemon) => pokemon.id === id)

  if (index === -1) {
    return c.json({ message: 'Pokémon introuvable' }, 404)
  }

  wishlist.splice(index, 1) // supprime 1 élément à la position index
  return c.json({ message: 'Pokémon supprimé' }, 200)
})

export { app, resetWishlist }
