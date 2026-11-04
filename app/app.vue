<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { WishlistItem } from '../utils/wishlist'
import { rechercherPokemon as chercherPokemonAPI } from '../utils/pokemonApi'
import {
  chargerWishlistApi,
  ajouterPokemonApi,
  supprimerPokemonApi,
} from '../utils/wishlistApi'

// Variables
const recherche = ref('')
const pokemon = ref<WishlistItem | null>(null)
const erreur = ref('')
const chargement = ref(false)
const wishlist = ref<WishlistItem[]>([])

// Au chargement de la page : on récupère la wishlist depuis le backend
// "async" permet d'utiliser "await" pour attendre la réponse du serveur
onMounted(async () => {
  try {
    wishlist.value = await chargerWishlistApi()
  } catch {
    erreur.value = 'Impossible de contacter le serveur.'
  }
})

// Rechercher un Pokémon avec la PokéAPI (inchangé)
async function rechercherPokemon(): Promise<void> {
  chargement.value = true
  erreur.value = ''
  pokemon.value = null

  try {
    pokemon.value = await chercherPokemonAPI(recherche.value)
  } catch {
    erreur.value = 'Pokémon introuvable. Vérifie son nom.'
  } finally {
    chargement.value = false
  }
}

// Ajouter un Pokémon : c'est maintenant le backend qui vérifie les règles
async function ajouterPokemon(): Promise<void> {
  if (pokemon.value === null) {
    return
  }

  try {
    // Le backend refuse si doublon (409) ou si la liste est pleine (400)
    const ajoute = await ajouterPokemonApi(pokemon.value)
    wishlist.value.push(ajoute) // on ajoute aussi dans la liste affichée
    erreur.value = ''
  } catch (e) {
    // e instanceof Error vérifie que e est bien une erreur avec un message
    if (e instanceof Error) {
      erreur.value = e.message // message envoyé par le backend
    } else {
      erreur.value = "Impossible d'ajouter le Pokémon."
    }
  }
}

// Supprimer un Pokémon : d'abord côté backend, ensuite dans la liste affichée
async function supprimerPokemon(id: number): Promise<void> {
  try {
    await supprimerPokemonApi(id)
  } catch {
    erreur.value = 'Impossible de supprimer le Pokémon.'
    return // on s'arrête : le backend n'a pas supprimé
  }

  // Même boucle qu'avant pour retirer le Pokémon de la liste affichée
  for (let i = 0; i < wishlist.value.length; i++) {
    if (wishlist.value[i]?.id === id) {
      wishlist.value.splice(i, 1)
      break
    }
  }

  erreur.value = ''
}
</script>

<template>
  <main class="container">
    <h1>Pokémon Wishlist</h1>

    <p>Recherche tes Pokémon préférés et ajoute-les à ta wishlist.</p>

    <form @submit.prevent="rechercherPokemon">
      <input
        v-model="recherche"
        type="text"
        placeholder="Nom d'un Pokémon..."
        required
      />

      <button type="submit" :disabled="chargement">
        {{ chargement ? 'Recherche...' : 'Rechercher' }}
      </button>
    </form>

    <p v-if="erreur" class="error">
      {{ erreur }}
    </p>

    <div v-if="pokemon" class="pokemon-card">
      <img v-if="pokemon.image" :src="pokemon.image" :alt="pokemon.name" />

      <h2>{{ pokemon.name }}</h2>

      <button @click="ajouterPokemon">Ajouter à ma wishlist</button>
    </div>

    <section class="wishlist">
      <h2>Ma wishlist ({{ wishlist.length }}/6)</h2>

      <p v-if="wishlist.length === 0">
        Aucun Pokémon dans ta wishlist pour le moment.
      </p>

      <div class="pokemon-grid">
        <div v-for="element in wishlist" :key="element.id" class="pokemon-card">
          <img v-if="element.image" :src="element.image" :alt="element.name" />

          <h3>{{ element.name }}</h3>

          <button @click="supprimerPokemon(element.id)">Supprimer</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  text-align: center;
  font-family: Arial, sans-serif;
}

h1 {
  color: #e3350d;
}

form {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 25px 0;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  padding: 10px 15px;
  background-color: #e3350d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #b52b0b;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: red;
}

.pokemon-card {
  padding: 15px;
  margin: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #fff;
}

.pokemon-card img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.wishlist {
  margin-top: 40px;
}
</style>
