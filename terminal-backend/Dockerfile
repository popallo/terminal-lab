FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Installer les dépendances système nécessaires pour node-gyp et node-pty
RUN apk add --no-cache bash openssh-client python3 make g++ py3-pip && \
    ln -sf /usr/bin/python3 /usr/bin/python

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["node", "server.js"]