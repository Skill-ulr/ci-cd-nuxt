import 'dotenv/config'
import path from 'node:path'
import process from 'node:process'
import { pool } from './db.js'
import { appliquerMigrations } from './migrations.js'

// Lance les migrations sur la base indiquée par DATABASE_URL (backend/.env)
async function main() {
  const appliquees = await appliquerMigrations(pool, path.resolve('migrations'))

  if (appliquees.length === 0) {
    process.stdout.write('Aucune nouvelle migration\n')
  }
  for (const nom of appliquees) {
    process.stdout.write('Migration appliquée : ' + nom + '\n')
  }
}

main()
  .catch((erreur) => {
    process.stdout.write('ERREUR : ' + erreur.message + '\n')
    process.exitCode = 1 // fait échouer la commande
  })
  .finally(() => pool.end())
