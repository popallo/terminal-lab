// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
      '@pinia/nuxt',
    ],
    css: [
      '~/assets/css/main.css',
    ],
    app: {
      head: {
        title: 'Laboratoire DevOps Interactif',
        meta: [
          { name: 'description', content: 'Plateforme d\'apprentissage DevOps avec des exercices interactifs via terminal' }
        ],
      }
    },
    // Configuration pour les imports côté client uniquement
    build: {
      transpile: ['socket.io-client']
    },
    // Ignorer la bibliothèque xterm côté serveur
    vite: {
      optimizeDeps: {
        exclude: ['xterm', 'xterm-addon-fit']
      },
      ssr: {
        noExternal: ['socket.io-client']
      }
    }
  })