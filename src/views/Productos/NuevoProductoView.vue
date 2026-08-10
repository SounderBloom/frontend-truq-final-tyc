<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import ProductService from '../../services/ProductosService'
import { useUbicacion } from '../../composables/useUbicacion'
import { TipoTransaccion } from '../../utils/tipoTransaccion'
import TopBar from '../../components/TopBar.vue'
import BottomNav from '../../components/BottomNav.vue'

import type { CategoriaDTO } from '../../models/CategoriaDTO'
import type { TipoTransaccionDTO } from '../../models/TipoTransaccionDTO'
import type { CrearProductoDTO } from '../../models/CrearProductoDTO'
import type { InsertarFotoProductoDTO } from '../../models/InsertarFotoProductoDTO'

const router = useRouter()
const { latitud, longitud, cargandoUbicacion, ubicacionDisponible, obtenerUbicacion } = useUbicacion()

const titulo = ref("")
const precio = ref<number | null>(null)
const descripcion = ref("")
const categoriaId = ref(0)
const tipoTransaccion = ref<number>(TipoTransaccion.Trueque)

const categorias = ref<CategoriaDTO[]>([])
const tiposTransaccion = ref<TipoTransaccionDTO[]>([])
const fotos = ref<InsertarFotoProductoDTO[]>([])
const previews = ref<string[]>([])

const enviando = ref(false)
const mensaje = ref('')

onMounted(async () => {
    await cargarCatalogos()
    await obtenerUbicacion()
})

const cargarCatalogos = async () => {
    try {
        const categoriasResponse = await ProductService.obtenerCategorias()
        categorias.value = categoriasResponse.data.data

        const tiposResponse = await ProductService.obtenerTiposTransaccion()
        tiposTransaccion.value = tiposResponse.data.data
    }
    catch (err) {
        console.error(err)
    }
}

const requierePrecio = computed(() =>
    tipoTransaccion.value === TipoTransaccion.Venta || tipoTransaccion.value === TipoTransaccion.TruequeOVenta
)

const seleccionarFotos = (event: Event) => {

    const input = event.target as HTMLInputElement
    if (!input.files) return

    const nuevosArchivos = Array.from(input.files)

    fotos.value = [
        ...fotos.value,
        ...nuevosArchivos.map((file, index) => ({ orden: fotos.value.length + index + 1, foto: file }))
    ]

    previews.value = [...previews.value, ...nuevosArchivos.map((file) => URL.createObjectURL(file))]

}

const renumerar = () => {
    fotos.value.forEach((foto, i) => { foto.orden = i + 1 })
}

const quitarFoto = (index: number) => {
    fotos.value.splice(index, 1)
    previews.value.splice(index, 1)
    renumerar()
}

// El campo Orden decide en qué orden se muestran las fotos en el detalle
// del artículo, y la de menor Orden es la miniatura principal.
const moverFoto = (index: number, direccion: -1 | 1) => {

    const destino = index + direccion
    if (destino < 0 || destino >= fotos.value.length) return

    ;[fotos.value[index], fotos.value[destino]] = [fotos.value[destino], fotos.value[index]]
    ;[previews.value[index], previews.value[destino]] = [previews.value[destino], previews.value[index]]

    renumerar()

}

const crearProducto = async () => {

    mensaje.value = ''

    if (!ubicacionDisponible.value) {
        mensaje.value = 'Debes permitir el acceso a tu ubicación para publicar.'
        return
    }

    if (!categoriaId.value) {
        mensaje.value = 'Selecciona una categoría.'
        return
    }

    const dto: CrearProductoDTO = {
        titulo: titulo.value,
        precio: requierePrecio.value ? (precio.value ?? 0) : 0,
        descripcion: descripcion.value,
        categoriaId: categoriaId.value,
        tipoTransaccion: tipoTransaccion.value,
        latitud: latitud.value!,
        longitud: longitud.value!,
        fotos: fotos.value
    }

    enviando.value = true

    try {
        await ProductService.crearProducto(dto)
        mensaje.value = 'Producto publicado correctamente.'
        setTimeout(() => router.push('/home'), 900)
    }
    catch (err: unknown) {
        console.error(err)
        const respuesta = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        mensaje.value = respuesta || 'No fue posible publicar el producto.'
    }
    finally {
        enviando.value = false
    }

}
</script>

<template>
    <div class="min-h-screen pb-32">
        <TopBar titulo="Publicar nuevo artículo" />

        <main class="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-md">
            <form class="space-y-lg" @submit.prevent="crearProducto">

                <section class="space-y-sm">
                    <label class="font-label-md text-label-md text-on-surface-variant">Fotos</label>
                    <div class="grid grid-cols-4 gap-3">
                        <div v-for="(preview, index) in previews" :key="index" class="relative aspect-square rounded-xl overflow-hidden bg-surface-container group">
                            <img :src="preview" class="w-full h-full object-contain" alt="" />

                            <span
                                class="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold glass-card"
                                :class="index === 0 ? 'text-primary' : 'text-on-surface'"
                            >{{ index === 0 ? 'Principal' : index + 1 }}</span>

                            <button type="button" class="absolute top-1 right-1 w-6 h-6 rounded-full glass-card flex items-center justify-center text-error" @click="quitarFoto(index)">
                                <span class="material-symbols-outlined text-[16px]">close</span>
                            </button>

                            <div class="absolute bottom-1 right-1 flex gap-1">
                                <button
                                    type="button" :disabled="index === 0"
                                    class="w-6 h-6 rounded-full glass-card flex items-center justify-center text-on-surface disabled:opacity-30"
                                    @click="moverFoto(index, -1)"
                                >
                                    <span class="material-symbols-outlined text-[16px]">chevron_left</span>
                                </button>
                                <button
                                    type="button" :disabled="index === previews.length - 1"
                                    class="w-6 h-6 rounded-full glass-card flex items-center justify-center text-on-surface disabled:opacity-30"
                                    @click="moverFoto(index, 1)"
                                >
                                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <label class="aspect-square rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-secondary cursor-pointer hover:border-primary hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-[28px]">add_a_photo</span>
                            <span class="text-label-sm">Añadir</span>
                            <input type="file" multiple accept="image/*" class="hidden" @change="seleccionarFotos" />
                        </label>
                    </div>
                    <p class="text-body-sm text-secondary">
                        Usa las flechas para ordenarlas. La marcada "Principal" es la que se ve primero en el detalle y como miniatura.
                    </p>
                </section>

                <div class="space-y-xs">
                    <label class="font-label-md text-label-md text-on-surface-variant" for="titulo">Título del artículo</label>
                    <input
                        id="titulo" v-model="titulo" type="text" required placeholder="Ej. Cámara Vintage Canon AE-1"
                        class="w-full px-4 py-3.5 bg-surface-container-low border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-body-md"
                    />
                </div>

                <div class="space-y-xs">
                    <label class="font-label-md text-label-md text-on-surface-variant">Categoría</label>
                    <select v-model="categoriaId" required class="w-full px-4 py-3.5 bg-surface-container-low border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-body-md">
                        <option :value="0" disabled>Selecciona una categoría</option>
                        <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">{{ categoria.nombre }}</option>
                    </select>
                </div>

                <div class="space-y-xs">
                    <label class="font-label-md text-label-md text-on-surface-variant" for="descripcion">Descripción</label>
                    <textarea
                        id="descripcion" v-model="descripcion" required rows="4" placeholder="Cuenta el estado, detalles y por qué es genial"
                        class="w-full px-4 py-3.5 bg-surface-container-low border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-body-md resize-none"
                    ></textarea>
                </div>

                <div class="space-y-xs">
                    <label class="font-label-md text-label-md text-on-surface-variant">Tipo de transacción</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                            v-for="tipo in tiposTransaccion" :key="tipo.id"
                            class="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all"
                            :class="tipoTransaccion === tipo.id ? 'border-primary bg-primary-container/10' : 'border-outline-variant'"
                        >
                            <input v-model="tipoTransaccion" type="radio" :value="tipo.id" class="accent-primary" />
                            <span class="text-body-md text-on-surface">{{ tipo.tipoTransaccion }}</span>
                        </label>
                    </div>
                </div>

                <div v-if="requierePrecio" class="space-y-xs">
                    <label class="font-label-md text-label-md text-on-surface-variant" for="precio">Precio sugerido</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                        <input
                            id="precio" v-model.number="precio" type="number" min="0" step="0.01" placeholder="0.00"
                            class="w-full pl-8 pr-4 py-3.5 bg-surface-container-low border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-body-md"
                        />
                    </div>
                </div>

                <div class="space-y-xs">
                    <label class="font-label-md text-label-md text-on-surface-variant">Ubicación</label>
                    <div class="flex items-center gap-2 px-4 py-3.5 bg-surface-container-low rounded-xl text-body-md">
                        <span class="material-symbols-outlined text-secondary">location_on</span>
                        <span v-if="cargandoUbicacion" class="text-secondary">Obteniendo ubicación...</span>
                        <span v-else-if="ubicacionDisponible" class="text-on-surface">Ubicación actual obtenida correctamente.</span>
                        <span v-else class="text-error">Debes permitir el acceso a tu ubicación para publicar.</span>
                    </div>
                </div>

                <p v-if="mensaje" class="text-body-sm font-body-sm" :class="mensaje.includes('correctamente') ? 'text-tertiary' : 'text-error'">{{ mensaje }}</p>

                <button
                    type="submit" :disabled="enviando || !ubicacionDisponible"
                    class="w-full bg-primary-container text-on-primary py-4 rounded-xl font-label-md text-label-md shadow-md hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-60"
                >
                    {{ enviando ? 'Publicando...' : 'Publicar artículo' }}
                </button>
            </form>
        </main>

        <BottomNav />
    </div>
</template>
