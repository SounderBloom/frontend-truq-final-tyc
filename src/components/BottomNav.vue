<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = [
    { path: '/home', label: 'Home', icon: 'home' },
    { path: '/buscar', label: 'Buscar', icon: 'search' },
    { path: '/productos/nuevo', label: 'Publicar', icon: 'add_circle' },
    { path: '/mensajes', label: 'Chat', icon: 'chat_bubble' },
    { path: '/perfil', label: 'Perfil', icon: 'person' },
]

const esActivo = (path: string) => route.path === path || route.path.startsWith(path + '/')
</script>

<template>
    <nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container-lowest border-t border-outline-variant shadow-lg">
        <a
            v-for="item in items"
            :key="item.path"
            href="#"
            class="flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all"
            :class="esActivo(item.path)
                ? 'bg-primary-container text-on-primary-container scale-90'
                : 'text-secondary hover:bg-surface-container-high'"
            @click.prevent="router.push(item.path)"
        >
            <span
                class="material-symbols-outlined"
                :style="esActivo(item.path) ? { fontVariationSettings: `'FILL' 1` } : {}"
            >{{ item.icon }}</span>
            <span class="text-label-sm font-label-sm">{{ item.label }}</span>
        </a>
    </nav>
</template>
