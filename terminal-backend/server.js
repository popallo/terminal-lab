const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');

// Configuration
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://votre-domaine.com' 
    : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Route racine
app.get('/', (req, res) => {
  res.send('Terminal Backend Service is running');
});

// Créer le serveur HTTP
const server = http.createServer(app);

// Configurer Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://votre-domaine.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Gestion des sessions utilisateur
const userSessions = {};

// Système de validation des exercices
const exercises = [
  {
    id: 1,
    title: "Bases du système de fichiers Linux",
    solutions: ["ls -la", "ls -a"],
    validator: (output) => output.includes('.') && output.includes('total')
  },
  {
    id: 2,
    title: "Gestion des processus",
    solutions: ["ps aux", "ps -ef"],
    validator: (output) => output.includes('PID') && output.includes('USER')
  },
  {
    id: 3,
    title: "Gestion du réseau",
    solutions: ["ip addr", "ifconfig", "ip a"],
    validator: (output) => output.includes('inet') || output.includes('eth')
  }
];

// Commandes autorisées (liste blanche pour sécurité)
const allowedCommands = [
  'ls', 'cd', 'pwd', 'cat', 'echo', 'ps', 'grep', 'find',
  'ip', 'ifconfig', 'netstat', 'ping', 'whoami', 'id',
  'date', 'uptime', 'free', 'df', 'du', 'top', 'mkdir',
  'touch', 'cp', 'mv', 'rm', 'chmod', 'chown', 'clear',
  'help'
];

// Fonction pour exécuter une commande
function executeCommand(command, socket, userId) {
  // Si la commande est help
  if (command.trim() === 'help') {
    socket.emit('terminal-output', `
Commandes disponibles:
- ls: Lister les fichiers
- cd: Changer de répertoire
- cat: Afficher le contenu d'un fichier
- ps: Afficher les processus
- ip addr / ifconfig: Afficher les interfaces réseau
- help: Afficher cette aide
`);
    return;
  }
  
  // Vérifier si la commande est autorisée
  const baseCommand = command.trim().split(' ')[0];
  if (!allowedCommands.includes(baseCommand)) {
    socket.emit('terminal-output', `Commande non autorisée: ${baseCommand}\n`);
    return;
  }
  
  // Exécuter la commande
  exec(command, { 
    timeout: 5000, // 5 secondes max
    shell: '/bin/bash'
  }, (error, stdout, stderr) => {
    // Stocker la sortie pour validation
    userSessions[userId].output += stdout + stderr;
    
    // Envoyer la sortie au client
    if (stdout) {
      socket.emit('terminal-output', stdout);
    }
    
    if (stderr) {
      socket.emit('terminal-output', stderr);
    }
    
    if (error && error.code !== 0) {
      socket.emit('terminal-output', `Erreur d'exécution: ${error.message}\n`);
    }
  });
}

// Configuration de Socket.IO
io.on('connection', (socket) => {
  console.log(`Client connecté: ${socket.id}`);
  
  // Créer une session pour cet utilisateur
  const userId = `user_${socket.id}`;
  userSessions[userId] = {
    output: '',
    commands: []
  };
  
  // Envoyer un message de bienvenue
  socket.emit('terminal-output', 'Terminal de formation DevOps connecté.\nTapez "help" pour voir les commandes disponibles.\n');
  
  // Envoyer la commande au serveur
  const trimmedCommand = currentCommand.value.trim();
  if (socket) {
    console.log('Envoi de la commande au serveur:', trimmedCommand);
    socket.emit('command', trimmedCommand);
  } else {
    // Simulation locale si pas de socket
    simulateCommand(trimmedCommand);
  }
  
  // Événement pour valider un exercice
  socket.on('validate-exercise', (exerciseId) => {
    console.log(`Validation demandée pour l'exercice ${exerciseId} par ${userId}`);
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const session = userSessions[userId];
    
    if (exercise && session) {
      console.log(`Commandes enregistrées:`, session.commands);
      
      // Vérifier toutes les commandes entrées (pas juste la dernière)
      const commandsCorrect = session.commands.some(cmd => 
        exercise.solutions.some(sol => cmd.trim() === sol.trim())
      );
      
      console.log(`Commandes correctes trouvées: ${commandsCorrect}`);
      console.log(`Output actuel:`, session.output);
      
      // Pour déboguer, essayons de valider juste sur la base des commandes
      const success = commandsCorrect;
      
      // Envoyer le résultat au client
      socket.emit('exercise-result', {
        exerciseId,
        success,
        message: success ? 'Bravo! Exercice réussi.' : 'Essayez encore!'
      });
      
      // Réinitialiser la sortie pour le prochain exercice
      if (success) {
        session.output = '';
      }
    } else {
      console.log(`Exercice ${exerciseId} non trouvé ou session non existante`);
    }
  });
  
  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log(`Client déconnecté: ${socket.id}`);
    
    // Nettoyer les ressources
    delete userSessions[userId];
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Terminal Backend Service démarré sur le port ${PORT}`);
});