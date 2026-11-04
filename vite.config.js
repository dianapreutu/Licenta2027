import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// "base" este numele repo-ului: aplicația publicată pe GitHub Pages
// se află la adresa https://dianapreutu.github.io/Licenta2027/
export default defineConfig({
  plugins: [react()],
  base: '/Licenta2027/'
});
