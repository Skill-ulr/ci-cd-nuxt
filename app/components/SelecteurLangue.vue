<script setup lang="ts">
import { LANGUES } from '../composables/useTraduction'

const { langue, changerLangue } = useTraduction()
</script>

<template>
  <div class="langues">
    <!-- Un bouton par langue ; celui de la langue active est désactivé -->
    <button
      v-for="code in LANGUES"
      :key="code"
      :disabled="code === langue"
      @click="changerLangue(code)"
    >
      {{ code.toUpperCase() }}
    </button>
  </div>
</template>

<style scoped>
.langues {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
}

button {
  padding: 6px 12px;
  background-color: #e3350d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
