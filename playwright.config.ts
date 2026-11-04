import { defineConfig } from '@playwright/test'

// Adresse de la base de test (la même que celle utilisée par Vitest)
const DATABASE_TEST_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://postgres:test@localhost:5433/pokewishlist_test'

export default defineConfig({
  // Dossier où se trouvent les tests de bout en bout
  testDir: './e2e',
  // Seuls les fichiers finissant par .e2e.ts sont des tests Playwright
  testMatch: '**/*.e2e.ts',
  use: {
    // Adresse de base : page.goto('/') ouvre http://localhost:3000/
    baseURL: 'http://localhost:3000',
  },
  // Playwright démarre lui-même les DEUX serveurs avant de lancer les tests
  webServer: [
    {
      // Serveur 1 : le backend Hono
      command: 'npm run dev',
      cwd: 'backend', // la commande est lancée dans le dossier backend
      url: 'http://localhost:3001/wishlist', // Playwright attend que cette adresse réponde
      // Le backend lancé par Playwright utilise la base de test, pas Supabase
      env: {
        DATABASE_URL: DATABASE_TEST_URL,
      },
      // 'pipe' affiche les messages du serveur dans le terminal (utile pour comprendre)
      stdout: 'pipe',
      stderr: 'pipe',
      reuseExistingServer: !process.env.CI,
    },
    {
      // Serveur 2 : le frontend Nuxt
      command: 'npm run dev',
      url: 'http://localhost:3000',
      stdout: 'pipe',
      stderr: 'pipe',
      reuseExistingServer: !process.env.CI,
      timeout: 120000, // Nuxt peut mettre du temps à démarrer (120 secondes max)
    },
  ],
})
