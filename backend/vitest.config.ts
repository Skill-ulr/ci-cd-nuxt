import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // On ne teste que le code source, pas le code compilé dans dist
    exclude: ['node_modules', 'dist']
  }
})