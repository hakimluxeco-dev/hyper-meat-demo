import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                whatsapp: resolve(__dirname, 'whatsapp-demo.html'),
            },
        },
    },
});
