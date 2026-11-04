<script setup lang="ts">
import { recupererFichePokemon } from '../../../utils/pokemonDetails'

// useRoute (fourni par Nuxt) donne accès à l'adresse : route.params.name = "pikachu"
const route = useRoute()
const name = String(route.params.name)

// useAsyncData charge la fiche côté serveur, avant d'afficher la page
// Le premier paramètre est un identifiant unique pour ce chargement
const { data: pokemon } = await useAsyncData('pokemon-' + name, () =>
  recupererFichePokemon(name),
)

// Pokémon introuvable : on affiche la page d'erreur 404 (vrai code HTTP 404)
if (!pokemon.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Pokémon introuvable',
    fatal: true,
  })
}

// Titre de l'onglet du navigateur
useHead({ title: 'Fiche de ' + pokemon.value.name })
</script>

<template>
  <main v-if="pokemon" class="container">
    <NuxtLink to="/">← Retour à ma wishlist</NuxtLink>

    <h1>{{ pokemon.name }} (n° {{ pokemon.id }})</h1>

    <img v-if="pokemon.image" :src="pokemon.image" :alt="pokemon.name" />

    <ul class="infos">
      <li>Types : {{ pokemon.types.join(', ') }}</li>
      <li>Taille : {{ pokemon.height }} m</li>
      <li>Poids : {{ pokemon.weight }} kg</li>
      <li>Capacités : {{ pokemon.abilities.join(', ') }}</li>
    </ul>
  </main>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  text-align: center;
  font-family: Arial, sans-serif;
}

h1 {
  color: #e3350d;
  text-transform: capitalize;
}

img {
  width: 200px;
  height: 200px;
  object-fit: contain;
}

.infos {
  list-style: none;
  padding: 0;
  text-align: left;
  display: inline-block;
}
</style>
