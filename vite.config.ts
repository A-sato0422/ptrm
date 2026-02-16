import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',  // mainは慣習的にトップページを指す
        action: './action.html',
        stage: './stage.html',
        profile: './profile.html',
        clients: './clients.html',
        clientDetail: './client-detail.html',
        settings: './settings.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
