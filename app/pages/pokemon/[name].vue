<script setup lang="ts">
import { recupererFichePokemon } from '../../../utils/pokemonDetails'
import { chargerLikesApi, ajouterLikeApi } from '../../../utils/likesApi'

const { t } = useTraduction()

// useRoute (fourni par Nuxt) donne accès à l'adresse : route.params.name = "pikachu"
const route = useRoute()
const name = String(route.params.name)

// useAsyncData charge la fiche côté serveur, avant d'afficher la page
const { data: pokemon } = await useAsyncData('pokemon-' + name, () =>
  recupererFichePokemon(name),
)

// Pokémon introuvable : page d'erreur 404 (vrai code HTTP 404)
if (!pokemon.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('pokemonNotFound'),
    fatal: true,
  })
}

// Titre de l'onglet du navigateur
useHead({ title: t('sheetTitle') + ' ' + pokemon.value.name })

// Likes : chargés dans le navigateur (le site statique reste indépendant de l'API)
const likes = ref(0)
const erreurLike = ref('')

onMounted(async () => {
  try {
    likes.value = await chargerLikesApi(name)
  } catch {
    erreurLike.value = t('errorServer')
  }
})

// Clic sur le bouton : le backend ajoute 1 et renvoie le nouveau total
async function aimer() {
  try {
    likes.value = await ajouterLikeApi(name)
    erreurLike.value = ''
  } catch {
    erreurLike.value = t('errorServer')
  }
}
</script>

<template>
  <main v-if="pokemon" class="container">
    <NuxtLink to="/">{{ t('backToWishlist') }}</NuxtLink>

    <h1>{{ pokemon.name }} ({{ t('numberShort') }} {{ pokemon.id }})</h1>

    <img v-if="pokemon.image" :src="pokemon.image" :alt="pokemon.name" />

    <ul class="infos">
      <li>{{ t('types') }} : {{ pokemon.types.join(', ') }}</li>
      <li>{{ t('height') }} : {{ pokemon.height }} m</li>
      <li>{{ t('weight') }} : {{ pokemon.weight }} kg</li>
      <li>{{ t('abilities') }} : {{ pokemon.abilities.join(', ') }}</li>
    </ul>

    <div class="likes">
      <button type="button" @click="aimer">{{ t('likeButton') }}</button>
      <p>
        {{ t('likesLabel') }} : <strong data-testid="likes">{{ likes }}</strong>
      </p>
      <p v-if="erreurLike" class="erreur">{{ erreurLike }}</p>
    </div>
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

.likes {
  margin-top: 20px;
}

.erreur {
  color: #e3350d;
}
</style>
