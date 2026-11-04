import { serve } from '@hono/node-server'
import { app } from './app.js'

serve({
  fetch: app.fetch,
  port: 3001 // 3000 est pris par Nuxt, le backend passe sur 3001
})
