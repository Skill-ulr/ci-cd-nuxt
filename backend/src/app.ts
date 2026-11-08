import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { pool } from './db.js'
import { choisirLangue, messages } from './i18n.js'

type Pokemon = {
  id: number
  name: string
  image?: string | null
}

const app = new Hono()

// Autorise le frontend (autre port) à appeler l'API
app.use('/*', cors())

const MAX_POKEMON = 6

// Si une erreur imprévue arrive (base inaccessible...), on répond 500 en JSON
app.onError((erreur, c) => {
  // eslint-disable-next-line no-console
  console.error(erreur)
  const m = messages(choisirLangue(c.req.header('Accept-Language')))
  return c.json({ message: m.serverError }, 500)
})

// Route simple pour vérifier que l'API tourne
app.get('/health', (c) => {
  return c.json({ status: 'casse' }, 200)
})

// GET : lire la wishlist dans la base
app.get('/wishlist', async (c) => {
  const resultat = await pool.query(
    'SELECT id, name, image FROM wishlist ORDER BY created_at',
  )
  return c.json(resultat.rows, 200)
})

// POST : ajouter un Pokémon
app.post('/wishlist', async (c) => {
  // m = tous les messages dans la langue demandée par le client
  const m = messages(choisirLangue(c.req.header('Accept-Language')))
  let pokemon: Pokemon

  try {
    pokemon = await c.req.json<Pokemon>()
  } catch {
    return c.json({ message: m.invalidJson }, 400)
  }

  // Règle 1 : entrée invalide
  if (
    !pokemon ||
    typeof pokemon.id !== 'number' ||
    typeof pokemon.name !== 'string' ||
    pokemon.name.trim() === ''
  ) {
    return c.json({ message: m.invalidPokemon }, 400)
  }

  // Règle 2 : pas de doublon
  const existe = await pool.query('SELECT id FROM wishlist WHERE id = $1', [
    pokemon.id,
  ])
  if (existe.rows.length > 0) {
    return c.json({ message: m.duplicate }, 409)
  }

  // Règle 3 : maximum 6 Pokémon
  const compte = await pool.query('SELECT COUNT(*)::int AS total FROM wishlist')
  if (compte.rows[0].total >= MAX_POKEMON) {
    return c.json({ message: m.full }, 400)
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
  const m = messages(choisirLangue(c.req.header('Accept-Language')))
  const id = Number(c.req.param('id'))

  if (Number.isNaN(id)) {
    return c.json({ message: m.notFound }, 404)
  }

  const resultat = await pool.query('DELETE FROM wishlist WHERE id = $1', [id])

  if (resultat.rowCount === 0) {
    return c.json({ message: m.notFound }, 404)
  }

  return c.json({ message: m.deleted }, 200)
})

// GET : nombre de likes d'un Pokémon (0 s'il n'en a jamais eu)
app.get('/likes/:name', async (c) => {
  const name = c.req.param('name').toLowerCase()
  const resultat = await pool.query(
    'SELECT total FROM likes WHERE pokemon_name = $1',
    [name],
  )
  let total = 0
  if (resultat.rows.length > 0) {
    total = resultat.rows[0].total
  }
  return c.json({ name, total }, 200)
})

// POST : ajouter un like (crée la ligne la première fois, puis ajoute 1)
app.post('/likes/:name', async (c) => {
  const m = messages(choisirLangue(c.req.header('Accept-Language')))
  const name = c.req.param('name').toLowerCase()

  // Nom valide : lettres minuscules, chiffres et tirets (50 caractères max)
  if (!/^[a-z0-9-]{1,50}$/.test(name)) {
    return c.json({ message: m.invalidPokemon }, 400)
  }

  // ON CONFLICT : si la ligne existe déjà, on ajoute 1 au lieu de la recréer
  const resultat = await pool.query(
    `INSERT INTO likes (pokemon_name, total) VALUES ($1, 1)
     ON CONFLICT (pokemon_name) DO UPDATE SET total = likes.total + 1
     RETURNING total`,
    [name],
  )
  return c.json({ name, total: resultat.rows[0].total }, 201)
})

export { app }
