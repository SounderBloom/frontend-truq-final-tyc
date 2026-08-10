<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ProductoDTO } from '../models/ProductoDTO'
import { resolverUrlArchivo } from '../services/api'
import { TipoTransaccion, etiquetaTipoTransaccion, formatearPrecio, formatearFechaRelativa } from '../utils/tipoTransaccion'

const props = defineProps<{
    producto: ProductoDTO
    distanciaKm?: number | null
    destacado?: boolean
}>()

const router = useRouter()

const imagen = computed(() => resolverUrlArchivo(props.producto.fotos?.[0]))

const esTrueque = computed(() =>
    props.producto.tipoTransaccion === TipoTransaccion.Trueque ||
    props.producto.tipoTransaccion === TipoTransaccion.TruequeOVenta ||
    props.producto.tipoTransaccion === TipoTransaccion.Donar
)

const irADetalle = () => router.push(`/productos/${props.producto.id}`)
</script>

<template>
    <div
        class="group relative bg-surface-container-lowest rounded-xl overflow-hidden product-card-shadow transition-transform hover:-translate-y-1 cursor-pointer"
        :class="destacado ? 'col-span-2' : ''"
        @click="irADetalle"
    >
        <div class="relative bg-surface-container h-48 sm:h-64" :class="destacado ? 'sm:h-80' : ''">
            <img v-if="imagen" :src="imagen" class="w-full h-full object-contain bg-surface-container" :alt="producto.titulo" />
            <div v-else class="w-full h-full flex items-center justify-center text-secondary">
                <span class="material-symbols-outlined text-[40px]">image</span>
            </div>

            <span
                v-if="destacado"
                class="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg"
            >Destacado</span>

            <div
                v-if="distanciaKm !== null && distanciaKm !== undefined"
                class="absolute bottom-3 left-3 px-2 py-1 glass-card rounded-lg flex items-center gap-1"
            >
                <span class="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                <span class="text-[10px] font-bold text-secondary uppercase tracking-wider">{{ distanciaKm.toFixed(1) }} km</span>
            </div>
        </div>
        <div class="p-sm space-y-xs">
            <h3 class="font-label-md text-label-md text-on-surface truncate">{{ producto.titulo }}</h3>
            <div class="flex items-center justify-between">
                <span
                    v-if="esTrueque"
                    class="inline-block px-2 py-0.5 bg-primary-container/10 text-primary-container text-[11px] font-bold rounded-full border border-primary-container/20"
                >{{ etiquetaTipoTransaccion(producto.tipoTransaccion).toUpperCase() }}</span>
                <span v-else class="font-bold text-primary text-label-md">{{ formatearPrecio(producto.precio) }}</span>
                <span class="text-label-sm text-secondary">{{ formatearFechaRelativa(producto.fechaPublicacion) }}</span>
            </div>
        </div>
    </div>
</template>
