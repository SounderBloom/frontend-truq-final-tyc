<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import NotificacionesService from '../services/NotificacionesService'
import { useNotificacionesStore } from '../stores/notificaciones'
import { TipoNotificacion } from '../models/NotificacionDTO'
import { formatearFechaRelativa } from '../utils/tipoTransaccion'
import TopBar from '../components/TopBar.vue'
import BottomNav from '../components/BottomNav.vue'

import type { NotificacionDTO } from '../models/NotificacionDTO'

const router = useRouter()
const notificacionesStore = useNotificacionesStore()

const notificaciones = ref<NotificacionDTO[]>([])
const cargando = ref(true)
const error = ref('')

onMounted(cargar)

async function cargar() {

    cargando.value = true
    error.value = ''

    try {
        const response = await NotificacionesService.obtenerNotificaciones(0)
        notificaciones.value = response.data.data
    }
    catch (err) {
        console.error(err)
        error.value = 'No fue posible cargar tus notificaciones.'
    }
    finally {
        cargando.value = false
    }

}

const iconoPorTipo = (tipo: TipoNotificacion) => {
    switch (tipo) {
        case TipoNotificacion.MensajeNuevo: return 'chat_bubble'
        case TipoNotificacion.PropuestaRecibida: return 'swap_horiz'
        case TipoNotificacion.PropuestaRespondida: return 'check_circle'
        case TipoNotificacion.CalificacionRecibida: return 'star'
        default: return 'notifications'
    }
}

const marcarTodasLeidas = async () => {
    await NotificacionesService.marcarTodasLeidas()
    notificaciones.value = notificaciones.value.map((n) => ({ ...n, leida: true }))
    notificacionesStore.noLeidas = 0
}

const abrirNotificacion = async (notificacion: NotificacionDTO) => {

    if (!notificacion.leida) {
        await NotificacionesService.marcarLeida(notificacion.id)
        notificacion.leida = true
        if (notificacionesStore.noLeidas > 0) notificacionesStore.noLeidas--
    }

    if (notificacion.tipo === TipoNotificacion.MensajeNuevo && notificacion.referenciaId) {
        router.push(`/mensajes/${notificacion.referenciaId}`)
        return
    }

    if (notificacion.tipo === TipoNotificacion.PropuestaRecibida || notificacion.tipo === TipoNotificacion.PropuestaRespondida || notificacion.tipo === TipoNotificacion.CalificacionRecibida) {
        router.push('/mensajes')
    }

}
</script>

<template>
    <div class="min-h-screen pb-32">
        <TopBar titulo="Notificaciones">
            <template #acciones>
                <button v-if="notificaciones.some((n) => !n.leida)" class="text-primary font-label-md text-label-sm" @click="marcarTodasLeidas">
                    Marcar todo como leído
                </button>
            </template>
        </TopBar>

        <main class="max-w-max-width mx-auto">
            <div v-if="cargando" class="text-center py-xl text-secondary">Cargando notificaciones...</div>
            <div v-else-if="error" class="text-center py-xl text-error">{{ error }}</div>

            <div v-else-if="notificaciones.length === 0" class="flex flex-col items-center text-center gap-3 py-xl px-margin-mobile">
                <span class="material-symbols-outlined text-[56px] text-secondary">notifications_off</span>
                <h2 class="font-headline-md text-headline-md text-on-surface">Sin notificaciones por ahora</h2>
                <p class="text-body-md text-secondary max-w-sm">Te avisaremos aquí cuando pase algo en TrueQ.</p>
            </div>

            <div v-else class="divide-y divide-outline-variant">
                <button
                    v-for="notificacion in notificaciones"
                    :key="notificacion.id"
                    class="w-full flex items-start gap-3 px-margin-mobile md:px-margin-desktop py-sm text-left hover:bg-surface-container-low transition-colors"
                    :class="notificacion.leida ? '' : 'bg-primary-container/5'"
                    @click="abrirNotificacion(notificacion)"
                >
                    <div class="w-10 h-10 rounded-full bg-primary-container/10 text-primary flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">{{ iconoPorTipo(notificacion.tipo) }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline gap-2">
                            <h3 class="font-label-md text-label-md text-on-surface">{{ notificacion.titulo }}</h3>
                            <span class="text-label-sm text-secondary flex-shrink-0">{{ formatearFechaRelativa(notificacion.fechaCreacion) }}</span>
                        </div>
                        <p class="text-body-sm text-secondary">{{ notificacion.contenido }}</p>
                    </div>
                    <span v-if="!notificacion.leida" class="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></span>
                </button>
            </div>
        </main>

        <BottomNav />
    </div>
</template>
