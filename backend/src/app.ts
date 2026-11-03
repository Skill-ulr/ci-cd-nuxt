import { Hono } from 'hono'

type Pokemon = {
  id: number
  name: string
}

const app = new Hono()

// Tableau temporaire en mémoire
const wishlist: Pokemon[] = []

// GET : récupérer la wishlist
app.get('/wishlist', (c) => {
  return c.json(wishlist, 200)
})

// POST : ajouter un Pokémon
app.post('/wishlist', async (c) => {
  const pokemon = await c.req.json<Pokemon>()

  wishlist.push(pokemon)

  return c.json(pokemon, 201)
})

// DELETE : supprimer un Pokémon
app.delete('/wishlist/:id', (c) => {
  const id = Number(c.req.param('id'))

  const index = wishlist.findIndex((pokemon) => pokemon.id === id)

  if (index === -1) {
    return c.json({ message: 'Pokémon introuvable' }, 404)
  }

  wishlist.splice(index, 1)

  return c.json({ message: 'Pokémon supprimé' }, 200)
})

export { app }
