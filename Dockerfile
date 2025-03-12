FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances globales
RUN npm install -g nuxt

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Construire l'application pour la production
RUN npm run build

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "dev"]