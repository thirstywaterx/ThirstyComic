// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n', "@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt"],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('s-')
    }
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        },
        '/uploads': {
          target: 'http://localhost:3001',
          changeOrigin: true
        },
        '/outputs': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    }
  },
  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zh', name: '中文', file: 'zh.json' }
    ]
  },
  routeRules: {
    '/': { redirect: '/console/projects' },
    '/console': { redirect: '/console/projects' },
  },
  ssr: false
})