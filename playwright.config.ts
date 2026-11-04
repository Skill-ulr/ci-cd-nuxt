import { defineConfig } from '@playwright/test'

export default defineConfig({
  // Dossier où se trouvent les tests de bout en bout
  testDir: './e2e',
  // Seuls les fichiers finissant par .e2e.ts sont des tests Playwright
  testMatch: '**/*.e2e.ts',
  use: {
    // Adresse de base : page.goto('/') ouvre http://localhost:3000/
    baseURL: 'http://localhost:3000',
  },
  // Playwright démarre lui-même les deux serveurs avant de lancer le test
  webServer: [
    {
      command: 'npm run dev',
      cwd: 'backend', // la commande est lancée dans le dossier backend
      url: 'http://localhost:3001/wishlist', // Playwright attend que cette adresse réponde
      // En local, on réutilise un serveur déjà lancé ; sur GitHub (CI), on en démarre un neuf
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000, // Nuxt peut mettre du temps à démarrer (120 secondes max)
    },
  ],
})
