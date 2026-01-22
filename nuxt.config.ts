import IconsResolver from 'unplugin-icons/resolver'
import ViteComponents from 'unplugin-vue-components/vite'

export default defineNuxtConfig({
    telemetry: { enabled: false },
    modules: ["@primevue/nuxt-module", 'nuxt-auth-utils', 'unplugin-icons/nuxt', '@nuxt/test-utils/module'],
    css: ['@/assets/styles/tailwind.css', '@/assets/styles/base.css', '@/assets/styles/styles.scss'],

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler'
                },
            },
        },
        plugins: [
            ViteComponents({
                resolvers: [
                    IconsResolver({
                        prefix: '',
                        strict: true,
                    }),
                ],
                dts: true,
            }),
        ],
    },

    devtools: {
        enabled: false
    },

    primevue: {
        options: { theme: 'none' },
        autoImport: false,
        components: {
            exclude: ['Form', 'FormField']
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

    compatibilityDate: '2025-03-10',
})
