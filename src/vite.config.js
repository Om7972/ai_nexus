import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // 1. Import the 'path' module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 2. Add an alias for the 'components' folder
      'components': path.resolve(__dirname, './src/components'),
      // Add other aliases as needed, for example:
      'pages': path.resolve(__dirname, './src/pages'),
    },
  },
});