<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useProductosStore } from '../../stores/productos'
import { useAuthStore } from '../../stores/auth'
import ChatsService from '../../services/ChatsService'
import ProductosService from '../../services/ProductosService'
import CalificacionesService from '../../services/CalificacionesService'
import { TipoTransaccion, etiquetaTipoTransaccion, formatearPrecio, formatearFechaRelativa } from '../../utils/tipoTransaccion'
import TopBar from '../../components/TopBar.vue'
import PhotoCarousel from '../../components/PhotoCarousel.vue'
import BottomNav from '../../components/BottomNav.vue'

import type { ProductoDTO } from '../../models/ProductoDTO'
import type { ResumenCalificacionesDTO } from '../../models/CalificacionDTO'

const props = defineProps<{ id: string }>()

const router = useRouter()
const productosStore = useProductosStore()
const authStore = useAuthStore()

// Mostramos primero lo que ya tengamos en cache (navegación instantánea)
// y refrescamos con el dato real del servidor.
const producto = ref<ProductoDTO | null>(productosStore.obtenerPorId(props.id))
const cargando = ref(true)
const noEncontrado = ref(false)
const calificacionVendedor = ref<ResumenCalificacionesDTO | null>(null)

const esTrueque = computed(() =>
    producto.value?.tipoTransaccion === TipoTransaccion.Trueque ||
    producto.value?.tipoTransaccion === TipoTransaccion.TruequeOVenta ||
    producto.value?.tipoTransaccion === TipoTransaccion.Donar
)
const esDonacion = computed(() => producto.value?.tipoTransaccion === TipoTransaccion.Donar)
const esPropio = computed(() => producto.value?.vendedorId === authStore.usuario?.nameIdentifier)

const iniciandoAccion = ref(false)
const mensajeAccion = ref('')

onMounted(async () => {

    try {
        const response = await ProductosService.obtenerPorId(props.id)
        const productoObtenido: ProductoDTO = response.data.data
        producto.value = productoObtenido
        productosStore.guardar([productoObtenido])

        const resumen = await CalificacionesService.obtenerDeUsuario(productoObtenido.vendedorId)
        calificacionVendedor.value = resumen.data.data
    }
    catch (err) {
        console.error(err)
        if (!producto.value) noEncontrado.value = true
    }
    finally {
        cargando.value = false
    }

})

// ChatsService.crearChat ahora reutiliza el chat existente entre este
// usuario y este producto en vez de crear uno nuevo cada vez (antes se
// duplicaba el chat cada vez que se entraba al detalle del producto).
const irAlChat = async (conProponer: boolean) => {

    if (!producto.value) return

    iniciandoAccion.value = true
    mensajeAccion.value = ''

    try {
        const response = await ChatsService.crearChat(producto.value.id)
        const chatId: string = response.data.data
        router.push(conProponer ? `/mensajes/${chatId}?proponer=1` : `/mensajes/${chatId}`)
    }
    catch (err) {
        console.error(err)
        mensajeAccion.value = 'No fue posible abrir el chat con el vendedor.'
    }
    finally {
        iniciandoAccion.value = false
    }

}
</script>

<template>
    <div class="min-h-screen pb-40">
        <TopBar :titulo="producto ? producto.titulo : 'Artículo'" />

        <main v-if="cargando && !producto" class="max-w-max-width mx-auto px-margin-mobile pt-xl text-center text-secondary">
            Cargando artículo...
        </main>

        <main v-else-if="!producto || noEncontrado" class="max-w-max-width mx-auto px-margin-mobile pt-xl text-center space-y-md">
            <span class="material-symbols-outlined text-[48px] text-secondary">search_off</span>
            <p class="text-body-md text-secondary">No pudimos encontrar este artículo.</p>
            <button class="text-primary font-label-md" @click="router.push('/home')">Ir al inicio</button>
        </main>

        <main v-else class="max-w-max-width mx-auto">
            <PhotoCarousel :fotos="producto.fotos" />

            <section class="px-margin-mobile md:px-margin-desktop py-md space-y-md">
                <div>
                    <span v-if="producto.nombreCategoria" class="inline-block px-2.5 py-1 bg-surface-container text-secondary text-label-sm font-label-sm rounded-full mb-2">
                        {{ producto.nombreCategoria }}
                    </span>
                    <h2 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{{ producto.titulo }}</h2>
                    <div class="flex items-center gap-3 mt-2">
                        <span v-if="!esTrueque" class="font-bold text-primary text-headline-md">{{ formatearPrecio(producto.precio) }}</span>
                        <span v-if="esTrueque" class="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-container/10 text-primary-container font-bold rounded-full border border-primary-container/20">
                            <span class="material-symbols-outlined text-[18px]">sync_alt</span>
                            {{ etiquetaTipoTransaccion(producto.tipoTransaccion) }}
                        </span>
                    </div>
                </div>

                <div>
                    <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide mb-1">Descripción detallada</h3>
                    <p class="text-body-md text-on-surface whitespace-pre-line">{{ producto.descripcion }}</p>
                </div>

                <div v-if="calificacionVendedor" class="flex items-center gap-2 text-body-sm">
                    <span class="material-symbols-outlined text-[18px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
                    <template v-if="calificacionVendedor.total > 0">
                        <span class="font-bold text-on-surface">{{ calificacionVendedor.promedio }}</span>
                        <span class="text-secondary">({{ calificacionVendedor.total }} reseñas del vendedor)</span>
                    </template>
                    <span v-else class="text-secondary">Vendedor sin reseñas todavía</span>
                </div>

                <div class="flex items-center gap-2 text-secondary text-body-sm">
                    <span class="material-symbols-outlined text-[18px]">schedule</span>
                    Publicado {{ formatearFechaRelativa(producto.fechaPublicacion) }}
                </div>

                <p v-if="mensajeAccion" class="text-body-sm text-error">{{ mensajeAccion }}</p>
            </section>
        </main>

        <footer v-if="producto && !esPropio" class="fixed bottom-16 left-0 w-full bg-surface-container-lowest border-t border-outline-variant p-md flex gap-3 z-40">
            <button
                :disabled="iniciandoAccion"
                class="flex-1 bg-surface-container text-on-surface py-3.5 rounded-xl font-label-md text-label-md disabled:opacity-60"
                @click="irAlChat(false)"
            >
                Enviar mensaje al vendedor
            </button>
            <button
                :disabled="iniciandoAccion"
                class="flex-1 flex items-center justify-center gap-2 bg-primary-container text-on-primary py-3.5 rounded-xl font-label-md text-label-md shadow-md active:scale-[0.98] disabled:opacity-60"
                @click="irAlChat(true)"
            >
                <span class="material-symbols-outlined text-[20px]">{{ esDonacion ? 'volunteer_activism' : 'sync_alt' }}</span>
                {{ esDonacion ? 'Pedir la donación' : 'Proponer oferta' }}
            </button>
        </footer>

        <BottomNav />
    </div>
</template>
