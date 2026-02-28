import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            components: path.resolve(__dirname, './src/components'),
            pages: path.resolve(__dirname, './src/pages'),
        },
    },

    server: {
        port: 5173,
        proxy: {
            // All /api/v1/* requests from the browser are forwarded to Express
            '/api/v1': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
