import js from '@eslint/js'
import tseslint from 'typescript-eslint'

// Un tableau de règles : ESLint les applique dans l'ordre
export default [
  // Dossiers à ignorer
  { ignores: ['dist', 'node_modules'] },
  // Règles de base recommandées pour JavaScript
  js.configs.recommended,
  // Règles recommandées pour TypeScript (le ... insère toutes les règles du tableau)
  ...tseslint.configs.recommended,
  {
    rules: {
      // 'error' = la commande lint échoue si la règle est violée
      'no-console': 'error',
      'no-debugger': 'error'
    }
  }
]