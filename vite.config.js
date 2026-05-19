import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        outDir: 'public/build',
        rollupOptions: {
            input: 'client/js/main.js'
        },
        manifest: true
    }
})