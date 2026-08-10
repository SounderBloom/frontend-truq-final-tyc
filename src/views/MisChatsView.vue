<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import ChatsService from '../services/ChatsService'
import { resolverUrlArchivo } from '../services/api'
import { etiquetaTipoTransaccion } from '../utils/tipoTransaccion'
import BottomNav from '../components/BottomNav.vue'
import NotificationBell from '../components/NotificationBell.vue'

import type { ChatDTO } from '../models/ChatDTO'

const router = useRouter()

const chats = ref<ChatDTO[]>([])
const cargando = ref(true)
const error = ref('')

onMounted(cargarChats)

async function cargarChats() {

    cargando.value = true
    error.value = ''

    try {
        const response = await ChatsService.obtenerListaChats(0)
        chats.value = response.data.data
    }
    catch (err) {
        console.error(err)
        error.value = 'No fue posible cargar tus mensajes.'
    }
    finally {
        cargando.value = false
    }

}

const formatearHora = (fechaIso: string) => {
    const fecha = new Date(fechaIso)
    const hoy = new Date()
    if (fecha.toDateString() === hoy.toDateString()) {
        return fecha.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
    }
    return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}
</script>

<template>
    <div class="min-h-screen pb-32">
        <header class="bg-surface flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-base sticky top-0 z-40 shadow-sm">
            <h1 class="font-headline-md text-headline-md font-bold text-on-surface">Mensajes</h1>
            <NotificationBell />
        </header>

        <main class="max-w-max-width mx-auto">
            <div v-if="cargando" class="text-center py-xl text-secondary">Cargando mensajes...</div>
            <div v-else-if="error" class="text-center py-xl text-error">{{ error }}</div>
            <div v-else-if="chats.length === 0" class="flex flex-col items-center text-center gap-3 py-xl px-margin-mobile">
                <span class="material-symbols-outlined text-[48px] text-secondary">chat_bubble</span>
                <p class="text-body-md text-secondary">Todavía no tienes conversaciones. Escribe a un vendedor desde el detalle de un artículo.</p>
            </div>

            <div v-else class="divide-y divide-outline-variant">
                <button
                    v-for="chat in chats"
                    :key="chat.id"
                    class="w-full flex items-center gap-3 px-margin-mobile md:px-margin-desktop py-sm text-left cursor-pointer hover:bg-surface-container-low transition-colors"
                    @click="router.push(`/mensajes/${chat.id}`)"
                >
                    <div class="w-14 h-14 rounded-full bg-surface-container overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img v-if="resolverUrlArchivo(chat.urlFotoUsuario)" :src="resolverUrlArchivo(chat.urlFotoUsuario) ?? ''" class="w-full h-full object-cover" alt="" />
                        <span v-else class="material-symbols-outlined text-secondary">person</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline">
                            <h3 class="font-label-md text-label-md text-on-surface truncate">{{ chat.nombreProductoSnapshot || 'Artículo' }}</h3>
                            <span class="text-label-sm text-secondary flex-shrink-0 ml-2">{{ formatearHora(chat.ultimoMovimiento) }}</span>
                        </div>
                        <div class="flex justify-between items-center mt-0.5">
                            <p class="text-body-sm text-secondary truncate">
                                {{ chat.ultimoMensaje?.contenido || `Trueque: ${etiquetaTipoTransaccion(chat.tipoTransaccionProductoSnapshot)}` }}
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </main>

        <BottomNav />
    </div>
</template>
