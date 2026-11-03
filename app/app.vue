<script setup lang="ts">
import { addPokemon } from '../utils/wishlist'
import { ref, onMounted } from 'vue'

// Type d'un Pokémon récupéré depuis l'API
type Pokemon = {
  id: number
  name: string
  sprites: {
    front_default: string | null
  }
}

// Type d'un Pokémon enregistré dans la wishlist
type WishlistItem = {
  id: number
  name: string
  image: string | null
}

// Variables
const recherche = ref<string>('')
const pokemon = ref<Pokemon | null>(null)
const erreur = ref<string>('')
const chargement = ref<boolean>(false)
const wishlist = ref<WishlistItem[]>([])

// Charger la wishlist au démarrage
onMounted(() => {
  const sauvegarde = localStorage.getItem('wishlist')

  if (sauvegarde !== null) {
    wishlist.value = JSON.parse(sauvegarde) as WishlistItem[]
  }
})

// Sauvegarder la wishlist
function sauvegarderWishlist(): void {
  const texte = JSON.stringify(wishlist.value)
  localStorage.setItem('wishlist', texte)
}

// Rechercher un Pokémon
async function rechercherPokemon(): Promise<void> {
  if (recherche.value === '') {
    erreur.value = 'Entre le nom d’un Pokémon.'
    return
  }

  chargement.value = true
  erreur.value = ''
  pokemon.value = null

  try {
    const resultat = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${recherche.value.toLowerCase()}`,
    )

    if (!resultat.ok) {
      throw new Error('Pokémon introuvable')
    }

    pokemon.value = (await resultat.json()) as Pokemon
  } catch {
    erreur.value = 'Pokémon introuvable.'
  }

  chargement.value = false
}

// Ajouter un Pokémon
function ajouterPokemon(): void {
  if (pokemon.value === null) {
    return
  }

  const nouveauPokemon = {
    id: pokemon.value.id,
    name: pokemon.value.name,
    image: pokemon.value.sprites.front_default
  }

  wishlist.value = addPokemon(wishlist.value, nouveauPokemon)

  sauvegarderWishlist()
}

// Supprimer un Pokémon
function supprimerPokemon(id: number): void {
  for (let i = 0; i < wishlist.value.length; i++) {
    if (wishlist.value[i]?.id === id) {
      wishlist.value.splice(i, 1)
      break
    }
  }

  sauvegarderWishlist()
}
</script>

<template>
  <main class="page">
    <header class="header">
      <h1>PokéWishlist</h1>
      <p>Construis ta collection de Pokémon favoris !</p>
    </header>

    <!-- Recherche -->
    <section class="search">
      <input
        v-model="recherche"
        placeholder="Rechercher un Pokémon..."
        @keyup.enter="rechercherPokemon"
      />

      <button @click="rechercherPokemon">Rechercher</button>
    </section>

    <p v-if="chargement" class="message">Recherche en cours...</p>

    <p v-if="erreur" class="error">
      {{ erreur }}
    </p>

    <!-- Pokémon recherché -->
    <section v-if="pokemon" class="result">
      <h2>Pokémon trouvé</h2>

      <div class="pokemon-card">
        <img
          v-if="pokemon.sprites.front_default"
          :src="pokemon.sprites.front_default"
          :alt="pokemon.name"
        />

        <h3>{{ pokemon.name }}</h3>

        <p>Pokémon n°{{ pokemon.id }}</p>

        <button @click="ajouterPokemon">Ajouter à ma wishlist</button>
      </div>
    </section>

    <!-- Wishlist -->
    <section class="wishlist">
      <h2>Ma collection</h2>

      <p v-if="wishlist.length === 0" class="message">
        Ta wishlist est vide. Recherche un Pokémon pour commencer !
      </p>

      <div class="pokemon-grid">
        <div v-for="element in wishlist" :key="element.id" class="pokemon-card">
          <img v-if="element.image" :src="element.image" :alt="element.name" />

          <h3>{{ element.name }}</h3>

          <p>Pokémon n°{{ element.id }}</p>

          <button class="delete-button" @click="supprimerPokemon(element.id)">
            Supprimer
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
  font-family: Arial, sans-serif;
  color: #333;
}

.header {
  text-align: center;
  background: #e53935;
  color: white;
  padding: 25px;
  border-radius: 12px;
}

.header h1 {
  margin: 0;
  font-size: 36px;
}

.search {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 30px 0;
}

input {
  padding: 12px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
  background: #e53935;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #c62828;
}

.result,
.wishlist {
  margin-top: 35px;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.pokemon-card {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 3px 8px #00000015;
}

.pokemon-card img {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.pokemon-card h3 {
  text-transform: capitalize;
}

.delete-button {
  background: #555;
}

.delete-button:hover {
  background: #333;
}

.message {
  text-align: center;
  color: #666;
}

.error {
  color: #e53935;
  text-align: center;
}

@media (max-width: 600px) {
  .search {
    flex-direction: column;
  }

  input {
    width: auto;
  }

  .page {
    padding: 15px;
  }
}
</style>
