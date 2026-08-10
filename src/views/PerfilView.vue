<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useProductosStore } from '../stores/productos'
import ProductosService from '../services/ProductosService'
import UsuariosService from '../services/UsuariosService'
import CalificacionesService from '../services/CalificacionesService'
import ProductCard from '../components/ProductCard.vue'
import BottomNav from '../components/BottomNav.vue'
import NotificationBell from '../components/NotificationBell.vue'

import type { ProductoDTO } from '../models/ProductoDTO'
import type { PerfilUsuarioDTO } from '../models/PerfilUsuarioDTO'
import type { CalificacionDTO } from '../models/CalificacionDTO'

const router = useRouter()
const authStore = useAuthStore()
const productosStore = useProductosStore()

const perfil = ref<PerfilUsuarioDTO | null>(null)
const misProductos = ref<ProductoDTO[]>([])
const resenas = ref<CalificacionDTO[]>([])
const cargando = ref(true)
const error = ref('')

const iniciales = (nombre: string) => (nombre || '?').trim().charAt(0).toUpperCase()

onMounted(async () => {

    try {
        const [perfilResponse, productosResponse] = await Promise.all([
            UsuariosService.miPerfil(),
            ProductosService.obtenerMisProductos()
        ])

        perfil.value = perfilResponse.data.data
        misProductos.value = productosResponse.data.data
        productosStore.guardar(misProductos.value)

        if (perfil.value) {
            const resenasResponse = await CalificacionesService.obtenerDeUsuario(perfil.value.id)
            resenas.value = resenasResponse.data.data.recientes
        }
    }
    catch (err) {
        console.error(err)
        error.value = 'No fue posible cargar tu perfil.'
    }
    finally {
        cargando.value = false
    }

})

const cerrarSesion = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <div class="min-h-screen pb-32">
        <header class="bg-surface flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-base sticky top-0 z-40 shadow-sm">
            <h1 class="font-headline-md text-headline-md font-bold text-primary">TrueQ</h1>
            <NotificationBell />
        </header>

        <main class="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-md space-y-lg">
            <div v-if="cargando" class="text-center py-xl text-secondary">Cargando perfil...</div>
            <div v-else-if="error || !perfil" class="text-center py-xl text-error">{{ error || 'No se encontró tu perfil.' }}</div>

            <template v-else>
                <section class="bg-surface-container-lowest rounded-xl product-card-shadow p-lg flex flex-col items-center text-center gap-2">
                    <div class="w-24 h-24 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-headline-lg font-bold border-4 border-primary-container/30">
                        {{ iniciales(perfil.nombre) }}
                    </div>
                    <h2 class="font-headline-md text-headline-md text-on-surface">{{ perfil.nombre }} {{ perfil.apellidoPaterno }}</h2>
                    <p class="text-body-sm text-secondary">{{ perfil.correo }}</p>

                    <div v-if="perfil.totalCalificaciones > 0" class="flex items-center gap-1 text-on-surface text-body-sm mt-1">
                        <span class="material-symbols-outlined text-[18px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
                        <span class="font-bold">{{ perfil.promedioCalificacion }}</span>
                        <span class="text-secondary">({{ perfil.totalCalificaciones }} reseñas)</span>
                    </div>

                    <p v-if="perfil.biografia" class="text-body-md text-on-surface max-w-sm mt-2">{{ perfil.biografia }}</p>

                    <div class="flex gap-lg mt-3">
                        <div class="text-center">
                            <p class="font-headline-md text-headline-md text-on-surface">{{ perfil.truequesRealizados }}</p>
                            <p class="text-label-sm text-secondary">Trueques realizados</p>
                        </div>
                        <div class="text-center">
                            <p class="font-headline-md text-headline-md text-on-surface">{{ perfil.articulosActivos }}</p>
                            <p class="text-label-sm text-secondary">Artículos activos</p>
                        </div>
                    </div>

                    <div class="flex gap-2 mt-4">
                        <button
                            v-if="authStore.usuario?.rol === 'Administrador'"
                            class="px-6 py-2.5 rounded-xl border border-primary text-primary font-label-md text-label-md flex items-center gap-1"
                            @click="router.push('/admin')"
                        >
                            <span class="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                            Panel de administrador
                        </button>
                        <button class="px-6 py-2.5 rounded-xl border border-error text-error font-label-md text-label-md" @click="cerrarSesion">
                            Cerrar sesión
                        </button>
                    </div>
                </section>

                <section class="space-y-md">
                    <h3 class="font-headline-md text-headline-md text-on-surface">Mis artículos</h3>
                    <div v-if="misProductos.length === 0" class="text-center py-lg text-secondary">
                        Aún no has publicado ningún artículo.
                    </div>
                    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <ProductCard v-for="producto in misProductos" :key="producto.id" :producto="producto" />
                    </div>
                </section>

                <section class="space-y-md">
                    <h3 class="font-headline-md text-headline-md text-on-surface">Reseñas</h3>
                    <div v-if="resenas.length === 0" class="text-center py-lg text-secondary">
                        Todavía no tienes reseñas.
                    </div>
                    <div v-else class="space-y-3">
                        <div v-for="resena in resenas" :key="resena.id" class="bg-surface-container-lowest rounded-xl product-card-shadow p-md">
                            <div class="flex justify-between items-start">
                                <p class="font-label-md text-label-md text-on-surface">{{ resena.calificadorNombre }}</p>
                                <div class="flex items-center gap-0.5 text-primary">
                                    <span v-for="n in 5" :key="n" class="material-symbols-outlined text-[16px]" :style="n <= resena.estrellas ? { fontVariationSettings: `'FILL' 1` } : {}">star</span>
                                </div>
                            </div>
                            <p v-if="resena.comentario" class="text-body-sm text-secondary mt-1">{{ resena.comentario }}</p>
                        </div>
                    </div>
                </section>
            </template>
        </main>

        <BottomNav />
    </div>
</template>
