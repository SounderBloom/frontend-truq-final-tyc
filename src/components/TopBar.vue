<script setup lang="ts">
import { useRouter } from 'vue-router'

withDefaults(defineProps<{
    titulo?: string
    mostrarVolver?: boolean
}>(), {
    titulo: '',
    mostrarVolver: true,
})

const router = useRouter()
</script>

<template>
    <header class="bg-surface flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-base sticky top-0 z-50 shadow-sm">
        <div class="flex items-center gap-3">
            <button
                v-if="mostrarVolver"
                class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface transition-colors active:scale-95"
                @click="router.back()"
            >
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 class="font-headline-md text-headline-md font-bold text-on-surface truncate">{{ titulo }}</h1>
        </div>
        <div class="flex items-center gap-2">
            <slot name="acciones" />
        </div>
    </header>
</template>
