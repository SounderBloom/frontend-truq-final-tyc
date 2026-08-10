<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificacionesStore } from '../stores/notificaciones'

const router = useRouter()
const notificacionesStore = useNotificacionesStore()

onMounted(() => {
    notificacionesStore.refrescarConteo()
})
</script>

<template>
    <button
        class="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95"
        @click="router.push('/notificaciones')"
    >
        <span class="material-symbols-outlined">notifications</span>
        <span
            v-if="notificacionesStore.noLeidas > 0"
            class="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center"
        >{{ notificacionesStore.noLeidas > 9 ? '9+' : notificacionesStore.noLeidas }}</span>
    </button>
</template>
