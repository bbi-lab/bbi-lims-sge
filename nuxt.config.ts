import * as path from "path";

export default defineNuxtConfig({
    modules: [ "@primevue/nuxt-module", 'nuxt-auth-utils'],
    css: ['@/assets/styles/tailwind.css', '@/assets/styles/base.css', '@/assets/styles/styles.scss'],
    vite: {
        css: {
            preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            },
            },
        },
    },
    primevue: {
        options: { theme: 'none' },
        autoImport: false,
        components: {
            exclude: []
        }
    },
    postcss: {
        plugins: {
            //'postcss-import': {},
            tailwindcss: {},
            autoprefixer: {}
        }
    },
    // Environment variables to read. These are available on the server side only, except for those in public, which are
    // also available on the application (client) side. Each is read from a capitalized snake-case variable with the
    // prefix NUXT_, so, for instance, `authSecret` is read from `NUXT_AUTH_SECRET`. If the environment variable is not
    // set, the default value below is used.
    runtimeConfig: {
        dbHost: 'localhost',
        dbPort: 5432,
        dbDatabaseName: 'sge_lims_db',
        dbUsername: 'postgres',
        dbPassword: 'postgres',
        dbSsl: false,
        authJwtAccessTokenExpiresIn: '5m',
        authJwtRefreshTokenExpiresIn: '60m',
        authJwtAccessTokenSecret: 'access-token-secret-base64',
        authJwtRefreshTokenSecret: 'refresh-token-secret-base64',
        public: {
            apiBase: '/api',
        }
    },
    nitro: {
        imports: {
            dirs: ['server/utils', 'shared'],
        },
    },
    imports: {
        dirs: ['composables', 'utils', 'shared'],
    },

});
