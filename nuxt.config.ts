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
})
