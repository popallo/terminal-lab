<template>
  <div class="container">
    <h1>Laboratoire DevOps</h1>
    
    <div class="lab-container">
      <div class="exercice-container">
        <ExercicePanel />
      </div>
      
      <div class="terminal-container">
        <Terminal ref="terminalComponent" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Terminal from '~/components/Terminal.vue';
import ExercicePanel from '~/components/ExercicePanel.vue';
import { ref } from 'vue';

const terminalComponent = ref(null);

// Fonction pour envoyer une commande au terminal depuis le parent
const sendCommandToTerminal = (command) => {
  if (terminalComponent.value) {
    terminalComponent.value.sendCommand(command);
  }
};

// Exposer la fonction pour d'autres composants ou pages
defineExpose({ sendCommandToTerminal });
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.lab-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .lab-container {
    grid-template-columns: 1fr;
  }
}
</style>