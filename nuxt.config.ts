import * as path from "path";

export default defineNuxtConfig({
    modules: [ "@primevue/nuxt-module", '@pinia/nuxt'],
    css: ['@/assets/styles/tailwind.css', '@/assets/styles/base.css', '@/assets/styles/styles.scss'],
    primevue: {
        options: { theme: 'none' },
        autoImport: false,
        components: {
            exclude: []
        }
    },
    postcss: {
        plugins: {
            'postcss-import': {},
            tailwindcss: {},
            autoprefixer: {}
        }
    },
    // Environment variables to read. These are available on the server side only, except for those in public, which are
    // also available on the application (client) side. Each is read from a capitalized snake-case variable with the
    // prefix NUXT_, so, for instance, `authSecret` is read from `NUXT_AUTH_SECRET`. If the environment variable is not
    // set, the default value below is used.
    runtimeConfig: {
        dbUrl: 'postgres://username:password@localhost:5432/db_name',
        public: {
            apiBase: '/api',
        }
    },
});
