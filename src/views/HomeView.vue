<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import ProductosService from '../services/ProductosService'
import { useProductosStore } from '../stores/productos'
import { useUbicacion } from '../composables/useUbicacion'
import { iconoCategoria } from '../utils/categoriaIconos'
import { calcularDistanciaKm } from '../utils/tipoTransaccion'
import ProductCard from '../components/ProductCard.vue'
import BottomNav from '../components/BottomNav.vue'
import NotificationBell from '../components/NotificationBell.vue'

import type { CategoriaDTO } from '../models/CategoriaDTO'
import type { ProductoDTO } from '../models/ProductoDTO'

const router = useRouter()
const productosStore = useProductosStore()
const { latitud, longitud, obtenerUbicacion } = useUbicacion()

const categorias = ref<CategoriaDTO[]>([])
const categoriaSeleccionada = ref<number | null>(null)
const productos = ref<ProductoDTO[]>([])
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')

onMounted(async () => {

    await obtenerUbicacion()
    await cargarCategorias()
    await cargarProductos()

})

const cargarCategorias = async () => {

    try {
        const response = await ProductosService.obtenerCategorias()
        categorias.value = response.data.data
    }
    catch (err) {
        console.error(err)
    }

}

const cargarProductos = async () => {

    cargando.value = true
    error.value = ''

    try {
        const response = await ProductosService.buscarProductos({
            latitud: latitud.value ?? 19.4326,
            longitud: longitud.value ?? -99.1332,
            radio: 50,
            cantidadPorPagina: 20,
            categoriaId: categoriaSeleccionada.value
        })

        productos.value = response.data.data.productos
        productosStore.guardar(productos.value)
    }
    catch (err) {
        console.error(err)
        error.value = 'No fue posible cargar los artículos cercanos.'
    }
    finally {
        cargando.value = false
    }

}

const seleccionarCategoria = (id: number | null) => {
    categoriaSeleccionada.value = id
    cargarProductos()
}

const irABuscar = () => {
    router.push({ path: '/buscar', query: busqueda.value ? { q: busqueda.value } : {} })
}

const distancia = (producto: ProductoDTO) => {
    if (latitud.value === null || longitud.value === null) return null
    return calcularDistanciaKm(latitud.value, longitud.value, producto.latitud, producto.longitud)
}
</script>

<template>
    <div class="min-h-screen">
        <header class="bg-surface flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-base z-40 sticky top-0 shadow-sm">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container bg-primary-container/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">swap_horiz</span>
                </div>
                <h1 class="font-headline-md text-headline-md font-bold text-primary">TrueQ</h1>
            </div>
            <NotificationBell />
        </header>

        <main class="max-w-max-width mx-auto pb-32">
            <section class="px-margin-mobile md:px-margin-desktop pt-md space-y-md">
                <div class="relative group">
                    <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary">
                        <span class="material-symbols-outlined">search</span>
                    </div>
                    <input
                        v-model="busqueda"
                        type="text"
                        placeholder="¿Qué quieres intercambiar hoy?"
                        class="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-none rounded-xl product-card-shadow focus:ring-2 focus:ring-primary transition-all text-body-md placeholder:text-secondary"
                        @keyup.enter="irABuscar"
                        @focus="irABuscar"
                    />
                </div>

                <div class="flex gap-4 overflow-x-auto hide-scrollbar -mx-margin-mobile px-margin-mobile pb-2">
                    <button class="flex flex-col items-center gap-2 group min-w-[72px]" @click="seleccionarCategoria(null)">
                        <div
                            class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-all"
                            :class="categoriaSeleccionada === null ? 'bg-primary-container text-white' : 'bg-surface-container-lowest text-secondary border border-outline-variant'"
                        >
                            <span class="material-symbols-outlined text-[28px]">category</span>
                        </div>
                        <span class="font-label-sm text-label-sm" :class="categoriaSeleccionada === null ? 'text-on-surface' : 'text-secondary'">Todos</span>
                    </button>
                    <button
                        v-for="categoria in categorias"
                        :key="categoria.id"
                        class="flex flex-col items-center gap-2 group min-w-[72px]"
                        @click="seleccionarCategoria(categoria.id)"
                    >
                        <div
                            class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                            :class="categoriaSeleccionada === categoria.id ? 'bg-primary-container text-white shadow-md' : 'bg-surface-container-lowest text-secondary border border-outline-variant hover:border-primary hover:text-primary'"
                        >
                            <span class="material-symbols-outlined text-[28px]">{{ iconoCategoria(categoria.nombre) }}</span>
                        </div>
                        <span class="font-label-sm text-label-sm" :class="categoriaSeleccionada === categoria.id ? 'text-on-surface' : 'text-secondary'">{{ categoria.nombre }}</span>
                    </button>
                </div>
            </section>

            <section class="px-margin-mobile md:px-margin-desktop mt-lg">
                <div class="flex justify-between items-center mb-md">
                    <h2 class="font-headline-md text-headline-md text-on-surface">Explorar Cerca de Ti</h2>
                    <button class="flex items-center gap-1 text-primary font-label-md" @click="router.push('/buscar')">
                        <span class="material-symbols-outlined text-sm">tune</span>
                        Filtros
                    </button>
                </div>

                <div v-if="cargando" class="text-center py-xl text-secondary">Cargando artículos...</div>
                <div v-else-if="error" class="text-center py-xl text-error">{{ error }}</div>
                <div v-else-if="productos.length === 0" class="text-center py-xl text-secondary">
                    <span class="material-symbols-outlined text-[40px] block mb-2">search_off</span>
                    No hay artículos cerca de ti todavía.
                </div>
                <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <ProductCard
                        v-for="(producto, index) in productos"
                        :key="producto.id"
                        :producto="producto"
                        :distancia-km="distancia(producto)"
                        :destacado="index === 4"
                    />
                </div>
            </section>
        </main>

        <BottomNav />
    </div>
</template>
