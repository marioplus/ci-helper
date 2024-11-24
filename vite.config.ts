import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, {cdn, util} from 'vite-plugin-monkey'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vuetify(),
        monkey({
            entry: 'src/main.ts',
            userscript: {
                icon: 'https://vitejs.dev/logo.svg',
                namespace: 'mario',
                match: ['*://*/*/pipelines/new', 'www.google.com'],
            },
            build: {
                externalGlobals: {
                    'reflect-metadata': cdn.jsdelivr('Reflect', 'Reflect.min.js').concat(util.dataUrl(`;var Reflect=window.Reflect;`)),
                    vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
                }
            },
        }),
    ],
})
