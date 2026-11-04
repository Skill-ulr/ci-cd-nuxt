import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // On ne teste que le code source, pas le code compilé dans dist
    exclude: ['node_modules', 'dist'],
    // Les tests utilisent TOUJOURS la base de test, jamais celle de Supabase
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ||
        'postgresql://postgres:test@localhost:5433/pokewishlist_test'
    },
    // Un seul fichier de test à la fois : ils partagent la même base
    fileParallelism: false
  }
})