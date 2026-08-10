<script setup lang="ts">
import { ref, computed } from 'vue'
import { resolverUrlArchivo } from '../services/api'

const props = defineProps<{
    fotos: string[]
}>()

const indiceActual = ref(0)

const urls = computed(() => props.fotos.map((f) => resolverUrlArchivo(f)).filter((u): u is string => !!u))

const irA = (indice: number) => {
    indiceActual.value = indice
}

const anterior = () => {
    indiceActual.value = indiceActual.value === 0 ? urls.value.length - 1 : indiceActual.value - 1
}

const siguiente = () => {
    indiceActual.value = indiceActual.value === urls.value.length - 1 ? 0 : indiceActual.value + 1
}

let inicioX = 0
const onTouchStart = (e: TouchEvent) => { inicioX = e.touches[0].clientX }
const onTouchEnd = (e: TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - inicioX
    if (Math.abs(deltaX) < 40) return
    if (deltaX > 0) anterior()
    else siguiente()
}
</script>

<template>
    <div class="relative h-72 sm:h-96 bg-surface-container overflow-hidden" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <template v-if="urls.length > 0">
            <img :src="urls[indiceActual]" class="w-full h-full object-contain" alt="" />

            <template v-if="urls.length > 1">
                <button
                    class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-card flex items-center justify-center text-on-surface"
                    @click="anterior"
                >
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                    class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-card flex items-center justify-center text-on-surface"
                    @click="siguiente"
                >
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>

                <div class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    <button
                        v-for="(_, index) in urls"
                        :key="index"
                        class="w-2 h-2 rounded-full transition-all"
                        :class="index === indiceActual ? 'bg-white w-5' : 'bg-white/50'"
                        @click="irA(index)"
                    />
                </div>

                <div class="absolute top-3 right-3 px-2 py-1 glass-card rounded-lg text-label-sm text-on-surface">
                    {{ indiceActual + 1 }}/{{ urls.length }}
                </div>
            </template>
        </template>

        <div v-else class="w-full h-full flex items-center justify-center text-secondary">
            <span class="material-symbols-outlined text-[64px]">image</span>
        </div>
    </div>
</template>
