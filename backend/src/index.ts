// Doit être le PREMIER import : il charge le fichier .env avant tout le reste
import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from './app.js'

serve({
  fetch: app.fetch,
  port: 3001,
})
