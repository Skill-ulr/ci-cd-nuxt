import { handle } from 'hono/aws-lambda'
import { app } from './app.js'

// AWS Lambda appelle "handler" à chaque requête ; "handle" traduit la requête AWS vers Hono
export const handler = handle(app)
