<template>
  <div class="simple-terminal">
    <div class="terminal-output" ref="outputContainer">
      <div v-for="(line, index) in terminalLines" :key="index" class="terminal-line" v-html="formatLine(line)"></div>
    </div>
    <div class="terminal-input-container">
      <span class="prompt">$</span>
      <input 
        ref="terminalInput" 
        v-model="currentCommand" 
        @keydown.enter="executeCommand" 
        class="terminal-input"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useLaboratoireStore } from '~/stores/laboratoire';

const laboratoireStore = useLaboratoireStore();
const terminalLines = ref(['Bienvenue dans le terminal de formation DevOps']);
const currentCommand = ref('');
const outputContainer = ref(null);
const terminalInput = ref(null);

// Fonction pour formater le texte avec coloration syntaxique basique
function formatLine(line) {
  // Coloration basique des commandes
  if (line.startsWith('$')) {
    return `<span class="command">${line}</span>`;
  }
  
  // Coloration basique des erreurs
  if (line.toLowerCase().includes('error') || line.toLowerCase().includes('erreur')) {
    return `<span class="error-text">${line}</span>`;
  }
  
  // Coloration des éléments de fichier dans les listages
  if (line.match(/\.([a-z]+)(\s|$)/i)) {
    return line.replace(/(\S+\.[a-z]+)(\s|$)/gi, '<span class="file">$1</span>$2');
  }
  
  return line;
}

// Fonction pour ajouter une ligne au terminal
function addLine(line) {
  terminalLines.value.push(line);
  // Garder une taille raisonnable pour le terminal
  if (terminalLines.value.length > 100) {
    terminalLines.value.shift();
  }
  
  // Scroll vers le bas pour voir la dernière ligne
  nextTick(() => {
    if (outputContainer.value) {
      outputContainer.value.scrollTop = outputContainer.value.scrollHeight;
    }
  });
}

// Exécute la commande courante
function executeCommand() {
  if (currentCommand.value.trim() === '') return;
  
  // Afficher la commande avec le prompt
  addLine(`$ ${currentCommand.value}`);
  
  // Stocker la commande dans le store pour validation
  laboratoireStore.setLastCommand(currentCommand.value);
  
  // Simuler l'exécution de la commande
  simulateCommand(currentCommand.value.trim());
  
  // Vider l'entrée pour la prochaine commande
  currentCommand.value = '';
}

// Simulation de commandes basiques
function simulateCommand(cmd) {
  const command = cmd.toLowerCase();
  
  if (command === 'help') {
    addLine('Commandes disponibles:');
    addLine('- ls: Lister les fichiers');
    addLine('- cd: Changer de répertoire');
    addLine('- cat: Afficher le contenu d\'un fichier');
    addLine('- help: Afficher cette aide');
    return;
  }
  
  if (command === 'ls' || command === 'ls -l') {
    addLine('fichier1.txt fichier2.conf dossier1/ dossier2/');
    return;
  }
  
  if (command === 'ls -a' || command === 'ls -la' || command === 'ls -al') {
    addLine('. .. .hidden fichier1.txt fichier2.conf dossier1/ dossier2/');
    // Vérifier automatiquement l'exercice 1
    validateCurrentExercise(command);
    return;
  }
  
  if (command.startsWith('cat ')) {
    addLine('Contenu du fichier demandé...');
    return;
  }
  
  if (command === 'ps' || command === 'ps -e') {
    addLine('  PID TTY          TIME CMD');
    addLine('    1 ?        00:00:01 init');
    addLine('  123 ?        00:01:23 bash');
    return;
  }
  
  if (command === 'ps aux' || command === 'ps -ef') {
    addLine('USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND');
    addLine('root         1  0.0  0.1   2388  1264 ?        Ss   Mar12   0:00 /sbin/init');
    addLine('user       123  0.0  0.5   5416  3204 pts/0    Ss   Mar12   0:00 -bash');
    addLine('user       456  0.0  0.1   2952   760 pts/0    R+   Mar12   0:00 ps aux');
    // Vérifier automatiquement l'exercice 2
    validateCurrentExercise(command);
    return;
  }
  
  if (command === 'ifconfig' || command === 'ip addr' || command === 'ip a') {
    addLine('eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500');
    addLine('        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255');
    addLine('        inet6 fe80::216:3eff:fe12:345  prefixlen 64  scopeid 0x20<link>');
    // Vérifier automatiquement l'exercice 3
    validateCurrentExercise(command);
    return;
  }
  
  if (command === 'clear') {
    terminalLines.value = [];
    return;
  }
  
  // Commande non reconnue
  addLine(`Commande exécutée: ${command}`);
}

// Vérifier si la commande correspond à l'exercice en cours
function validateCurrentExercise(command) {
  const currentExercice = laboratoireStore.currentExercice;
  
  if (currentExercice && currentExercice.solution) {
    const isCorrect = currentExercice.solution.some(sol => 
      command.trim() === sol.trim()
    );
    
    if (isCorrect) {
      laboratoireStore.setExerciceResult({
        exerciseId: currentExercice.id,
        success: true,
        message: 'Bravo! Exercice réussi.'
      });
      addLine('✅ Commande correcte! Exercice réussi.');
    }
  }
}

onMounted(() => {
  if (process.client) {
    // Focus sur l'input
    if (terminalInput.value) {
      terminalInput.value.focus();
    }
  }
});

// Fonction pour envoyer une commande au terminal depuis l'extérieur
const sendCommand = (command) => {
  if (command) {
    currentCommand.value = command;
    executeCommand();
  }
};

// Garder le focus sur l'input quand on clique sur le terminal
watch(terminalLines, () => {
  nextTick(() => {
    if (terminalInput.value) {
      terminalInput.value.focus();
    }
  });
});

// Exposer la fonction pour d'autres composants
defineExpose({ sendCommand });
</script>

<style scoped>
.simple-terminal {
  height: 400px;
  width: 100%;
  background-color: #1e1e1e;
  color: #f0f0f0;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: monospace;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.terminal-output {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.terminal-line {
  white-space: pre-wrap;
  margin-bottom: 4px;
  line-height: 1.4;
}

.terminal-input-container {
  display: flex;
  padding: 10px;
  background-color: #2d2d2d;
  border-top: 1px solid #444;
}

.prompt {
  color: #66c2cd;
  margin-right: 8px;
  font-weight: bold;
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #f0f0f0;
  font-family: monospace;
  font-size: 1em;
  outline: none;
}

/* Styles de coloration syntaxique */
:deep(.command) {
  color: #66c2cd;
  font-weight: bold;
}

:deep(.error-text) {
  color: #ff6b6b;
}

:deep(.file) {
  color: #a8d7fe;
}
</style>