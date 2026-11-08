// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      // Adresse du backend. Par défaut : local.
      // En production, la variable NUXT_PUBLIC_API_BASE la remplace
      apiBase: 'http://localhost:3001',
    },
  },
  hooks: {
    // Se lance au build : on ajoute une page HTML par Pokémon
    'nitro:config': async (nitroConfig) => {
      // Uniquement pour la commande "nuxt generate" (pas pour le build SSR)
      if (!process.argv.includes('generate')) {
        return
      }

      // On demande à PokéAPI les 151 premiers Pokémon
      const reponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
      if (!reponse.ok) {
        throw new Error('PokéAPI inaccessible : impossible de pré-générer')
      }
      const donnees = await reponse.json()

      // Une route par Pokémon : /pokemon/bulbasaur, /pokemon/ivysaur...
      const routes: string[] = []
      for (const pokemon of donnees.results) {
        routes.push('/pokemon/' + pokemon.name)
      }

      // On ajoute ces routes à la liste des pages à pré-générer
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      nitroConfig.prerender.routes.push(...routes)
    },
  },
})
