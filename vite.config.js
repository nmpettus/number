import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/number/', // change this if deploying to a subfolder
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
});

