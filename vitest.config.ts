import { defineVitestConfig } from '@nuxt/test-utils/config'

// See https://nuxt.com/docs/3.x/getting-started/testing
export default defineVitestConfig({
    test: {
        environment: 'nuxt',
        environmentOptions: {
        nuxt: {
            domEnvironment: 'happy-dom',
        },
        },
    },
})
