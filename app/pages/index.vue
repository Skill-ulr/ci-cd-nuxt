<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { WishlistItem } from '../../utils/wishlist'
import { rechercherPokemon as chercherPokemonAPI } from '../../utils/pokemonApi'
import {
  chargerWishlistApi,
  ajouterPokemonApi,
  supprimerPokemonApi,
} from '../../utils/wishlistApi'

// langue = langue active ("fr"...), t = fonction qui traduit une clé
const { langue, t } = useTraduction()

// Variables
const recherche = ref('')
const pokemon = ref<WishlistItem | null>(null)
const erreur = ref('')
const chargement = ref(false)
const wishlist = ref<WishlistItem[]>([])

// Au chargement de la page : on récupère la wishlist depuis le backend
onMounted(async () => {
  try {
    wishlist.value = await chargerWishlistApi(langue.value)
  } catch {
    erreur.value = t('errorServer')
  }
})

// Rechercher un Pokémon avec la PokéAPI
async function rechercherPokemon(): Promise<void> {
  chargement.value = true
  erreur.value = ''
  pokemon.value = null

  try {
    pokemon.value = await chercherPokemonAPI(recherche.value)
  } catch {
    erreur.value = t('errorSearch')
  } finally {
    chargement.value = false
  }
}

// Ajouter un Pokémon : le backend vérifie les règles
async function ajouterPokemon(): Promise<void> {
  if (pokemon.value === null) {
    return
  }

  try {
    const ajoute = await ajouterPokemonApi(pokemon.value, langue.value)
    wishlist.value.push(ajoute)
    erreur.value = ''
  } catch (e) {
    if (e instanceof Error) {
      erreur.value = e.message // message du backend, déjà traduit
    } else {
      erreur.value = t('errorAdd')
    }
  }
}

// Supprimer un Pokémon : d'abord côté backend, ensuite dans la liste affichée
async function supprimerPokemon(id: number): Promise<void> {
  try {
    await supprimerPokemonApi(id, langue.value)
  } catch {
    erreur.value = t('errorDelete')
    return
  }

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
    <h1>{{ t('title') }}</h1>

    <SelecteurLangue />

    <p>{{ t('intro') }}</p>

    <form @submit.prevent="rechercherPokemon">
      <input
        v-model="recherche"
        type="text"
        :placeholder="t('searchPlaceholder')"
        required
      />

      <button type="submit" :disabled="chargement">
        {{ chargement ? t('searching') : t('searchButton') }}
      </button>
    </form>

    <p v-if="erreur" class="error">
      {{ erreur }}
    </p>

    <div v-if="pokemon" class="pokemon-card">
      <img v-if="pokemon.image" :src="pokemon.image" :alt="pokemon.name" />

      <h2>{{ pokemon.name }}</h2>

      <NuxtLink :to="'/pokemon/' + pokemon.name">{{ t('viewSheet') }}</NuxtLink>

      <button @click="ajouterPokemon">{{ t('addButton') }}</button>
    </div>

    <section class="wishlist">
      <h2>{{ t('wishlistTitle') }} ({{ wishlist.length }}/6)</h2>

      <p v-if="wishlist.length === 0">
        {{ t('emptyWishlist') }}
      </p>

      <div class="pokemon-grid">
        <div v-for="element in wishlist" :key="element.id" class="pokemon-card">
          <img v-if="element.image" :src="element.image" :alt="element.name" />

          <h3>{{ element.name }}</h3>

          <NuxtLink :to="'/pokemon/' + element.name">{{
            t('viewSheet')
          }}</NuxtLink>

          <button @click="supprimerPokemon(element.id)">
            {{ t('deleteButton') }}
          </button>
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
