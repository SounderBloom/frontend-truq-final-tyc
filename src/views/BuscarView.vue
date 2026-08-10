<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import ProductosService from '../services/ProductosService'
import { useProductosStore } from '../stores/productos'
import { useUbicacion } from '../composables/useUbicacion'
import { TipoTransaccion } from '../utils/tipoTransaccion'
import ProductCard from '../components/ProductCard.vue'
import TopBar from '../components/TopBar.vue'
import BottomNav from '../components/BottomNav.vue'

import type { CategoriaDTO } from '../models/CategoriaDTO'
import type { TipoTransaccionDTO } from '../models/TipoTransaccionDTO'
import type { ProductoDTO } from '../models/ProductoDTO'

const RECIENTES_KEY = 'trueq_busquedas_recientes'

const route = useRoute()
const productosStore = useProductosStore()
const { latitud, longitud, obtenerUbicacion } = useUbicacion()

const termino = ref((route.query.q as string) ?? '')
const categorias = ref<CategoriaDTO[]>([])
const categoriaId = ref<number | null>(null)
const tiposTransaccion = ref<TipoTransaccionDTO[]>([])
const tipoTransaccion = ref<number | null>(null)
const presupuestoMax = ref(5000)
const distanciaKm = ref(15)
const cargando = ref(false)
const busquedaRealizada = ref(false)
const resultados = ref<ProductoDTO[]>([])
const recientes = ref<string[]>(JSON.parse(localStorage.getItem(RECIENTES_KEY) ?? '[]'))
const mostrarFiltros = ref(true)

// Las opciones del filtro de tipo de transacción salen del endpoint
// /Productos/TiposTransaccion (mismo enum que usa el backend), en vez de
// tenerlas hardcodeadas y desincronizadas del API.
const tiposTransaccionOpciones = computed(() => [
    { valor: null as number | null, etiqueta: 'Todos' },
    ...tiposTransaccion.value.map((tipo) => ({ valor: tipo.id as number | null, etiqueta: tipo.tipoTransaccion }))
])

const resultadosFiltrados = computed(() => resultados.value.filter((producto) => {
    const dentroPresupuesto = producto.tipoTransaccion === TipoTransaccion.Trueque || producto.precio <= presupuestoMax.value
    const coincideTermino = !termino.value || producto.titulo.toLowerCase().includes(termino.value.toLowerCase())
    return dentroPresupuesto && coincideTermino
}))

onMounted(async () => {
    await obtenerUbicacion()
    await cargarCategorias()
    await cargarTiposTransaccion()
    if (termino.value) await aplicarFiltros()
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

const cargarTiposTransaccion = async () => {
    try {
        const response = await ProductosService.obtenerTiposTransaccion()
        tiposTransaccion.value = response.data.data
    }
    catch (err) {
        console.error(err)
    }
}

const guardarReciente = (texto: string) => {
    if (!texto.trim()) return
    recientes.value = [texto, ...recientes.value.filter((r) => r !== texto)].slice(0, 5)
    localStorage.setItem(RECIENTES_KEY, JSON.stringify(recientes.value))
}

const borrarHistorial = () => {
    recientes.value = []
    localStorage.removeItem(RECIENTES_KEY)
}

const limpiarFiltros = () => {
    categoriaId.value = null
    tipoTransaccion.value = null
    presupuestoMax.value = 5000
    distanciaKm.value = 15
}

const aplicarFiltros = async () => {

    cargando.value = true
    busquedaRealizada.value = true
    guardarReciente(termino.value)

    try {
        const response = await ProductosService.buscarProductos({
            latitud: latitud.value ?? 19.4326,
            longitud: longitud.value ?? -99.1332,
            radio: distanciaKm.value,
            cantidadPorPagina: 30,
            categoriaId: categoriaId.value,
            tipoTransaccion: tipoTransaccion.value
        })

        resultados.value = response.data.data.productos
        productosStore.guardar(resultados.value)
        mostrarFiltros.value = false
    }
    catch (err) {
        console.error(err)
    }
    finally {
        cargando.value = false
    }

}

const buscarReciente = (texto: string) => {
    termino.value = texto
    aplicarFiltros()
}
</script>

<template>
    <div class="min-h-screen pb-32">
        <TopBar titulo="Buscar" />

        <main class="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop pt-md space-y-lg">
            <div class="relative group">
                <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary">
                    <span class="material-symbols-outlined">search</span>
                </div>
                <input
                    v-model="termino"
                    type="text"
                    placeholder="Buscar artículos..."
                    class="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-none rounded-xl product-card-shadow focus:ring-2 focus:ring-primary transition-all text-body-md placeholder:text-secondary"
                    @keyup.enter="aplicarFiltros"
                />
            </div>

            <section class="bg-surface-container-lowest rounded-xl product-card-shadow overflow-hidden">
                <button
                    type="button"
                    class="w-full flex justify-between items-center p-md"
                    @click="mostrarFiltros = !mostrarFiltros"
                >
                    <span class="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                        <span class="material-symbols-outlined text-secondary">tune</span>
                        Filtros
                    </span>
                    <span class="flex items-center gap-3">
                        <span
                            class="text-primary font-label-md text-label-md"
                            @click.stop="limpiarFiltros"
                        >Limpiar todo</span>
                        <span
                            class="material-symbols-outlined text-secondary transition-transform duration-300"
                            :class="mostrarFiltros ? 'rotate-180' : ''"
                        >expand_more</span>
                    </span>
                </button>

                <div
                    class="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    :style="{ gridTemplateRows: mostrarFiltros ? '1fr' : '0fr' }"
                >
                    <div class="overflow-hidden">
                        <div class="px-md pb-md space-y-md">
                            <div class="space-y-xs">
                                <label class="font-label-md text-label-md text-on-surface-variant">Categoría</label>
                                <select v-model="categoriaId" class="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-body-md outline-none focus:ring-2 focus:ring-primary/30">
                                    <option :value="null">Todas las categorías</option>
                                    <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">{{ categoria.nombre }}</option>
                                </select>
                            </div>

                            <div class="space-y-xs">
                                <label class="font-label-md text-label-md text-on-surface-variant">Tipo de transacción</label>
                                <div class="flex flex-wrap gap-2">
                                    <button
                                        v-for="opcion in tiposTransaccionOpciones"
                                        :key="opcion.etiqueta"
                                        class="px-4 py-2.5 rounded-xl font-label-md text-label-md border transition-all"
                                        :class="tipoTransaccion === opcion.valor ? 'bg-primary-container text-on-primary-container border-primary-container' : 'border-outline-variant text-secondary'"
                                        @click="tipoTransaccion = opcion.valor"
                                    >{{ opcion.etiqueta }}</button>
                                </div>
                            </div>

                            <div class="space-y-xs">
                                <div class="flex justify-between">
                                    <label class="font-label-md text-label-md text-on-surface-variant">Presupuesto máx.</label>
                                    <span class="font-label-md text-label-md text-primary">${{ presupuestoMax.toLocaleString('es-MX') }}</span>
                                </div>
                                <input v-model.number="presupuestoMax" type="range" min="0" max="20000" step="100" class="w-full accent-primary" />
                            </div>

                            <div class="space-y-xs">
                                <div class="flex justify-between">
                                    <label class="font-label-md text-label-md text-on-surface-variant">Distancia</label>
                                    <span class="font-label-md text-label-md text-primary">{{ distanciaKm }} km</span>
                                </div>
                                <input v-model.number="distanciaKm" type="range" min="1" max="100" step="1" class="w-full accent-primary" />
                            </div>

                            <button
                                class="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary py-3.5 rounded-xl font-label-md text-label-md shadow-md hover:bg-primary transition-all active:scale-[0.98]"
                                @click="aplicarFiltros"
                            >
                                <span class="material-symbols-outlined text-[20px]">filter_list</span>
                                Aplicar filtros
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="recientes.length && !busquedaRealizada" class="space-y-sm">
                <div class="flex justify-between items-center">
                    <h2 class="font-headline-md text-headline-md text-on-surface">Búsquedas recientes</h2>
                    <button class="flex items-center gap-1 text-secondary text-label-sm font-label-sm" @click="borrarHistorial">
                        <span class="material-symbols-outlined text-[16px]">delete_sweep</span>
                        Borrar historial
                    </button>
                </div>
                <button
                    v-for="reciente in recientes"
                    :key="reciente"
                    class="w-full flex items-center gap-3 py-3 border-b border-outline-variant text-left"
                    @click="buscarReciente(reciente)"
                >
                    <span class="material-symbols-outlined text-secondary">history</span>
                    <span class="flex-1 text-body-md text-on-surface">{{ reciente }}</span>
                    <span class="material-symbols-outlined text-secondary">chevron_right</span>
                </button>
            </section>

            <section v-if="busquedaRealizada" class="space-y-md">
                <h2 class="font-headline-md text-headline-md text-on-surface">Resultados</h2>
                <div v-if="cargando" class="text-center py-xl text-secondary">Buscando...</div>
                <div v-else-if="resultadosFiltrados.length === 0" class="text-center py-xl text-secondary">
                    No encontramos artículos con esos filtros.
                </div>
                <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <ProductCard v-for="producto in resultadosFiltrados" :key="producto.id" :producto="producto" />
                </div>
            </section>
        </main>

        <BottomNav />
    </div>
</template>
