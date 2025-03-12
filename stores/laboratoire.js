import { defineStore } from 'pinia';

export const useLaboratoireStore = defineStore('laboratoire', {
  state: () => ({
    exercices: [
      {
        id: 1,
        title: "Bases du système de fichiers Linux",
        description: "Listez tous les fichiers du répertoire courant, y compris les fichiers cachés.",
        solution: ["ls -la", "ls -a"],
        hints: [
          "Les fichiers cachés commencent par un point (.)",
          "L'option -a permet de voir tous les fichiers"
        ],
        expectedOutput: ["total", "."]
      },
      {
        id: 2,
        title: "Gestion des processus",
        description: "Affichez tous les processus en cours d'exécution.",
        solution: ["ps aux", "ps -ef"],
        hints: [
          "La commande ps permet d'afficher les processus",
          "Vous avez besoin d'options pour voir tous les processus"
        ],
        expectedOutput: ["PID", "USER", "COMMAND"]
      },
      {
        id: 3,
        title: "Gestion du réseau",
        description: "Affichez les interfaces réseau et leurs configurations.",
        solution: ["ip addr", "ifconfig", "ip a"],
        hints: [
          "La commande ip est l'outil moderne pour gérer le réseau",
          "L'ancienne commande ifconfig peut aussi être utilisée"
        ],
        expectedOutput: ["inet", "eth", "lo"]
      }
    ],
    currentExerciceIndex: 0,
    exerciceStatus: 'En cours',
    lastCommandResult: null
  }),
  
  getters: {
    currentExercice: (state) => state.exercices[state.currentExerciceIndex],
    
    totalExercices: (state) => state.exercices.length,
    
    progress: (state) => Math.round(((state.currentExerciceIndex + 1) / state.exercices.length) * 100)
  },
  
  actions: {
    setExerciceResult(result) {
      console.log('Store: setExerciceResult appelé avec:', result);
      
      if (result.exerciseId === this.currentExercice.id) {
        this.exerciceStatus = result.success ? 'Réussi' : 'Erreur';
        
        // Réinitialiser le statut après un délai si échec
        if (!result.success) {
          setTimeout(() => {
            this.exerciceStatus = 'En cours';
          }, 2000);
        }
      }
    },
    
    setLastCommand(command) {
      this.lastCommandResult = command;
    },
    
    goToNextExercice() {
      if (this.currentExerciceIndex < this.exercices.length - 1) {
        this.currentExerciceIndex++;
        this.exerciceStatus = 'En cours';
        this.lastCommandResult = null;
      } else {
        // Tous les exercices sont terminés
        this.exerciceStatus = 'Terminé';
      }
    },
    
    resetExercices() {
      this.currentExerciceIndex = 0;
      this.exerciceStatus = 'En cours';
      this.lastCommandResult = null;
    }
  }
});