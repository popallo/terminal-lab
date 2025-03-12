<template>
  <div class="exercice-panel">
    <div class="exercice-header">
      <h2>{{ currentExercice.title }}</h2>
      <div class="exercice-status" :class="statusClass">
        {{ status }}
      </div>
    </div>
    
    <div class="exercice-description">
      <p>{{ currentExercice.description }}</p>
      <div v-if="currentExercice.hints && currentExercice.hints.length > 0" class="hints">
        <div v-for="(hint, index) in currentExercice.hints" :key="index">
          <button v-if="!hintsShown[index]" @click="showHint(index)" class="hint-button">
            Voir indice {{ index + 1 }}
          </button>
          <div v-if="hintsShown[index]" class="hint-content">
            <strong>Indice {{ index + 1 }}:</strong> {{ hint }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="exercice-validation">
      <button @click="validateExercice" class="validate-btn" :disabled="isSuccess">
        Valider l'exercice
      </button>
      
      <div v-if="isSuccess" class="success-message">
        Bravo ! Exercice réussi.
        <button @click="nextExercice" class="next-btn">
          Exercice suivant →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useLaboratoireStore } from '~/stores/laboratoire';

const laboratoireStore = useLaboratoireStore();
const hintsShown = ref([]);

const currentExercice = computed(() => laboratoireStore.currentExercice);
const status = computed(() => laboratoireStore.exerciceStatus);
const isSuccess = computed(() => status.value === 'Réussi');

const statusClass = computed(() => {
  switch (status.value) {
    case 'Réussi': return 'status-success';
    case 'En cours': return 'status-in-progress';
    case 'Erreur': return 'status-error';
    default: return '';
  }
});

watch(currentExercice, () => {
  // Réinitialiser les indices affichés à chaque nouvel exercice
  if (currentExercice.value && currentExercice.value.hints) {
    hintsShown.value = Array(currentExercice.value.hints.length).fill(false);
  } else {
    hintsShown.value = [];
  }
}, { immediate: true });

function showHint(index) {
  hintsShown.value[index] = true;
}

function validateExercice() {
  console.log('Validation de l\'exercice:', currentExercice.value.id);
  
  // Validation côté client
  const lastExecutedCommand = laboratoireStore.lastCommandResult;
  console.log('Dernière commande exécutée:', lastExecutedCommand);
  
  if (lastExecutedCommand && currentExercice.value.solution) {
    const isCorrect = currentExercice.value.solution.some(sol => 
      lastExecutedCommand.trim() === sol.trim()
    );
    
    laboratoireStore.setExerciceResult({
      exerciseId: currentExercice.value.id,
      success: isCorrect,
      message: isCorrect ? 'Bravo! Exercice réussi.' : 'Essayez encore!'
    });
  } else {
    laboratoireStore.setExerciceResult({
      exerciseId: currentExercice.value.id,
      success: false,
      message: 'Entrez d\'abord une commande dans le terminal'
    });
  }
}

function nextExercice() {
  laboratoireStore.goToNextExercice();
}
</script>

<style scoped>
.exercice-panel {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.exercice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.exercice-status {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.status-success {
  background-color: #d4edda;
  color: #155724;
}

.status-in-progress {
  background-color: #fff3cd;
  color: #856404;
}

.status-error {
  background-color: #f8d7da;
  color: #721c24;
}

.exercice-description {
  margin-bottom: 20px;
}

.hints {
  margin-top: 15px;
}

.hint-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  margin-bottom: 5px;
}

.hint-content {
  margin-top: 10px;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.exercice-validation {
  margin-top: 20px;
}

.validate-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.validate-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.success-message {
  margin-top: 15px;
  padding: 15px;
  background-color: #d4edda;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.next-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
</style>