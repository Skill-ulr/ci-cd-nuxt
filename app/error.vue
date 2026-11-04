<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

const { t } = useTraduction()

function retourAccueil(): void {
  clearError({ redirect: '/' })
}
</script>

<template>
  <main class="erreur">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.statusMessage }}</p>
    <button @click="retourAccueil">{{ t('backHome') }}</button>
  </main>
</template>

<style scoped>
.erreur {
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 30px;
  text-align: center;
  font-family: Arial, sans-serif;
}

h1 {
  color: #e3350d;
  font-size: 64px;
}

button {
  padding: 10px 15px;
  background-color: #e3350d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
