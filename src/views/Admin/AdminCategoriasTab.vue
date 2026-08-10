<script setup lang="ts">
import { ref, onMounted } from 'vue'

import CategoriasService from '../../services/CategoriasService'

import type { CategoriaDTO } from '../../models/CategoriaDTO'

const categorias = ref<CategoriaDTO[]>([])
const cargando = ref(true)
const error = ref('')

const nuevaCategoria = ref('')
const creando = ref(false)

const edicionId = ref<number | null>(null)
const nombreEdicion = ref('')
const guardando = ref(false)

onMounted(cargar)

async function cargar() {

    cargando.value = true
    error.value = ''

    try {
        const response = await CategoriasService.obtenerTodas()
        categorias.value = response.data.data
    }
    catch (err) {
        console.error(err)
        error.value = 'No fue posible cargar las categorías. Verifica que tu cuenta tenga rol de administrador.'
    }
    finally {
        cargando.value = false
    }

}

const crearCategoria = async () => {

    if (!nuevaCategoria.value.trim()) return

    creando.value = true

    try {
        await CategoriasService.crear(nuevaCategoria.value.trim())
        nuevaCategoria.value = ''
        await cargar()
    }
    catch (err) {
        console.error(err)
        error.value = 'No fue posible crear la categoría.'
    }
    finally {
        creando.value = false
    }

}

const iniciarEdicion = (categoria: CategoriaDTO) => {
    edicionId.value = categoria.id
    nombreEdicion.value = categoria.nombre
}

const cancelarEdicion = () => {
    edicionId.value = null
    nombreEdicion.value = ''
}

const guardarEdicion = async (categoria: CategoriaDTO) => {

    if (!nombreEdicion.value.trim()) return

    guardando.value = true

    try {
        await CategoriasService.actualizar(categoria.id, nombreEdicion.value.trim())
        categoria.nombre = nombreEdicion.value.trim()
        cancelarEdicion()
    }
    catch (err) {
        console.error(err)
        error.value = 'No fue posible actualizar la categoría.'
    }
    finally {
        guardando.value = false
    }

}

const eliminarCategoria = async (categoria: CategoriaDTO) => {

    try {
        await CategoriasService.eliminar(categoria.id)
        categorias.value = categorias.value.filter((c) => c.id !== categoria.id)
    }
    catch (err) {
        console.error(err)
        error.value = 'No fue posible eliminar la categoría (puede tener artículos asociados).'
    }

}
</script>

<template>
    <section class="space-y-md">
        <form class="flex gap-2" @submit.prevent="crearCategoria">
            <input
                v-model="nuevaCategoria"
                type="text"
                placeholder="Nueva categoría..."
                class="flex-1 px-4 py-3 bg-surface-container-low rounded-xl border-none outline-none text-body-md focus:ring-2 focus:ring-primary/20"
            />
            <button
                type="submit"
                :disabled="creando || !nuevaCategoria.trim()"
                class="px-4 py-3 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-60 flex items-center gap-1"
            >
                <span class="material-symbols-outlined text-[18px]">add</span>
                Agregar
            </button>
        </form>

        <p v-if="error" class="text-error text-body-sm">{{ error }}</p>

        <div v-if="cargando" class="text-center py-lg text-secondary">Cargando categorías...</div>
        <div v-else-if="categorias.length === 0" class="text-center py-lg text-secondary">No hay categorías registradas.</div>

        <div v-else class="bg-surface-container-lowest rounded-xl product-card-shadow overflow-hidden divide-y divide-outline-variant">
            <div v-for="categoria in categorias" :key="categoria.id" class="p-md flex items-center gap-3">
                <template v-if="edicionId === categoria.id">
                    <input
                        v-model="nombreEdicion"
                        type="text"
                        class="flex-1 px-3 py-2 bg-surface-container-low rounded-lg border-none outline-none text-body-md"
                        @keyup.enter="guardarEdicion(categoria)"
                    />
                    <button :disabled="guardando" class="text-primary font-label-md text-label-sm" @click="guardarEdicion(categoria)">Guardar</button>
                    <button class="text-secondary font-label-md text-label-sm" @click="cancelarEdicion">Cancelar</button>
                </template>
                <template v-else>
                    <span class="flex-1 text-body-md text-on-surface">{{ categoria.nombre }}</span>
                    <button class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low text-secondary" @click="iniciarEdicion(categoria)">
                        <span class="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-error-container text-error" @click="eliminarCategoria(categoria)">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </template>
            </div>
        </div>
    </section>
</template>
