import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Les tests backend ont leur propre commande, on ne garde ici que le frontend
    exclude: ['node_modules', 'backend', 'e2e', '.nuxt', '.output'],
  },
})
