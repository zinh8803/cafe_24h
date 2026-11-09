import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  srcDir: 'app',
  dir: {
    public: fileURLToPath(new URL('./public', import.meta.url)),
  },
  alias: {
    '@game': fileURLToPath(new URL('./game', import.meta.url)),
  },
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || '',
    },
  },
  vite: {
    server: {
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://127.0.0.1:3001',
          ws: true,
          changeOrigin: true,
        },
      },
    },
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://127.0.0.1:3001/api',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3001/socket.io',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  app: {
    head: {
      title: '24h Café — A little place to slow down',
      htmlAttrs: {
        lang: 'vi',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        {
          name: 'description',
          content:
            'Quán cà phê ảo hoạt động 24/7 trên trình duyệt. Chọn bàn cạnh cửa sổ, gọi một ly cà phê sữa đá, lắng nghe tiếng mưa và trò chuyện cùng những người đang thức.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
});
