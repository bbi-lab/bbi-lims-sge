<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

</script>

<template>
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div class="text-center mb-8">
                <img alt="logo" src="/images/bbi.png" class="w-40 mx-auto mb-2" />
            </div>
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center" style="border-radius: 53px">
                    <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">Error</h1>
                    <div class="text-surface-600 dark:text-surface-200 mb-8">{{ error }}</div>
                    <Button as="router-link" label="Go to Home" to="/" />
                </div>
            </div>
        </div>
    </div>
</template>
