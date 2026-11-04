import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { pool } from './db.js'

type Pokemon = {
  id: number
  name: string
  image?: string | null
}

const app = new Hono()

// Autorise le frontend (autre port) à appeler l'API
app.use('/*', cors())

const MAX_POKEMON = 7

// Si une erreur imprévue arrive (base inaccessible...), on répond 500 en JSON
app.onError((erreur, c) => {
  // eslint-disable-next-line no-console
  console.error(erreur)
  return c.json({ message: 'Erreur serveur' }, 500)
})

// Route simple pour vérifier que l'API tourne (utile pour AWS plus tard)
app.get('/health', (c) => {
  return c.json({ status: 'ok' }, 200)
})

// GET : lire la wishlist dans la base
app.get('/wishlist', async (c) => {
  const resultat = await pool.query(
    'SELECT id, name, image FROM wishlist ORDER BY created_at',
  )
  // resultat.rows = le tableau des lignes trouvées
  return c.json(resultat.rows, 200)
})

// POST : ajouter un Pokémon
app.post('/wishlist', async (c) => {
  let pokemon: Pokemon

  try {
    pokemon = await c.req.json<Pokemon>()
  } catch {
    return c.json({ message: 'JSON invalide' }, 400)
  }

  // Règle 1 : entrée invalide
  if (
    !pokemon ||
    typeof pokemon.id !== 'number' ||
    typeof pokemon.name !== 'string' ||
    pokemon.name.trim() === ''
  ) {
    return c.json({ message: 'Pokémon invalide' }, 400)
  }

  // Règle 2 : pas de doublon
  // $1 est remplacé par la valeur du tableau [pokemon.id] : requête paramétrée
  const existe = await pool.query('SELECT id FROM wishlist WHERE id = $1', [
    pokemon.id,
  ])
  if (existe.rows.length > 0) {
    return c.json({ message: 'Pokémon déjà dans la wishlist' }, 409)
  }

  // Règle 3 : maximum 6 Pokémon
  // ::int transforme le résultat de COUNT en nombre (sinon il arrive en texte)
  const compte = await pool.query('SELECT COUNT(*)::int AS total FROM wishlist')
  if (compte.rows[0].total >= MAX_POKEMON) {
    return c.json({ message: 'Wishlist pleine (6 maximum)' }, 400)
  }

  // L'image est facultative : sans image, on enregistre null (vide)
  let image: string | null = null
  if (pokemon.image) {
    image = pokemon.image
  }

  await pool.query(
    'INSERT INTO wishlist (id, name, image) VALUES ($1, $2, $3)',
    [pokemon.id, pokemon.name, image],
  )

  return c.json(pokemon, 201)
})

// DELETE : supprimer un Pokémon
app.delete('/wishlist/:id', async (c) => {
  const id = Number(c.req.param('id'))

  // Si l'id n'est pas un nombre (ex : /wishlist/abc), le Pokémon n'existe pas
  if (Number.isNaN(id)) {
    return c.json({ message: 'Pokémon introuvable' }, 404)
  }

  const resultat = await pool.query('DELETE FROM wishlist WHERE id = $1', [id])

  // rowCount = nombre de lignes supprimées : 0 veut dire "rien trouvé"
  if (resultat.rowCount === 0) {
    return c.json({ message: 'Pokémon introuvable' }, 404)
  }

  return c.json({ message: 'Pokémon supprimé' }, 200)
})

export { app }
