<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

import ChatsService from '../services/ChatsService'
import ProductosService from '../services/ProductosService'
import PropuestasService from '../services/PropuestasService'
import CalificacionesService from '../services/CalificacionesService'
import { resolverUrlArchivo } from '../services/api'
import { EmisorMensaje } from '../models/MensajeDTO'
import { EstadoPropuesta, TipoOferta, DireccionMonto } from '../models/PropuestaDTO'
import { TipoTransaccion, etiquetaTipoTransaccion, formatearPrecio } from '../utils/tipoTransaccion'
import { etiquetaTipoOferta, etiquetaDireccionMonto } from '../utils/propuestas'
import TopBar from '../components/TopBar.vue'

import type { ChatDTO } from '../models/ChatDTO'
import type { MensajeDTO } from '../models/MensajeDTO'
import type { ProductoDTO } from '../models/ProductoDTO'
import type { PropuestaDTO } from '../models/PropuestaDTO'

const props = defineProps<{ chatId: string }>()
const route = useRoute()

const chat = ref<ChatDTO | null>(null)
const cargando = ref(true)
const enviando = ref(false)
const texto = ref('')
const mensajes = ref<MensajeDTO[]>([])
const scrollContenedor = ref<HTMLElement | null>(null)

const propuestas = ref<PropuestaDTO[]>([])
const misProductosDisponibles = ref<ProductoDTO[]>([])
const mostrarFormularioPropuesta = ref(false)

const tipoOfertaSeleccionado = ref<TipoOferta>(TipoOferta.Trueque)
const productoOfrecidoId = ref('')
const monto = ref<number | null>(null)
const direccionMonto = ref<DireccionMonto>(DireccionMonto.ProponentePagaAlVendedor)
const mensajePropuesta = ref('')
const enviandoPropuesta = ref(false)
const errorPropuesta = ref('')

const propuestaParaCalificar = ref<PropuestaDTO | null>(null)
const estrellas = ref(0)
const comentario = ref('')
const enviandoCalificacion = ref(false)
const calificacionEnviada = ref(false)

let intervaloActualizacion: number | undefined

onMounted(async () => {

    try {
        const response = await ChatsService.obtenerListaChats(0)
        const chats: ChatDTO[] = response.data.data
        chat.value = chats.find((c) => c.id === props.chatId) ?? null

        if (chat.value) {
            await cargarMensajes()
            await cargarPropuestas()
            await desplazarAbajo()

            if (!chat.value.esVendedor && route.query.proponer === '1' && !tieneOfertaPendiente.value) {
                await abrirFormularioPropuesta()
            }

            // Como no hay WebSockets/SignalR en el backend, se revisa
            // periódicamente si llegaron mensajes u ofertas nuevas mientras
            // la conversación sigue abierta, en vez de requerir recargar la
            // página para verlos.
            intervaloActualizacion = window.setInterval(actualizarEnSegundoPlano, 4000)
        }
    }
    catch (err) {
        console.error(err)
    }
    finally {
        cargando.value = false
    }

})

onUnmounted(() => {
    if (intervaloActualizacion) clearInterval(intervaloActualizacion)
})

const actualizarEnSegundoPlano = async () => {

    if (!chat.value) return

    const cantidadAntes = mensajes.value.length

    await cargarMensajes()
    await cargarPropuestas()

    if (mensajes.value.length > cantidadAntes) {
        await desplazarAbajo()
    }

}

const cargarMensajes = async () => {

    if (!chat.value) return

    try {
        const response = await ChatsService.obtenerMensajes(chat.value.id)
        mensajes.value = response.data.data
    }
    catch (err) {
        console.error(err)
    }

}

const cargarPropuestas = async () => {

    if (!chat.value) return

    try {
        const response = await PropuestasService.obtenerPorChat(chat.value.id)
        propuestas.value = response.data.data
    }
    catch (err) {
        console.error(err)
    }

}

const tieneOfertaPendiente = computed(() =>
    propuestas.value.some((p) => p.estado === EstadoPropuesta.Pendiente)
)

// Un artículo publicado como "Donar" solo admite pedir la donación: sin
// trueque, compra ni diferencia en efectivo.
const esProductoDeDonacion = computed(() =>
    chat.value?.tipoTransaccionProductoSnapshot === TipoTransaccion.Donar
)

const enviarMensaje = async () => {

    if (!texto.value.trim() || !chat.value) return

    enviando.value = true
    const contenido = texto.value.trim()

    try {
        await ChatsService.enviarMensaje({ chatId: chat.value.id, mensaje: contenido })
        texto.value = ''
        await cargarMensajes()
        await desplazarAbajo()
    }
    catch (err) {
        console.error(err)
    }
    finally {
        enviando.value = false
    }

}

const desplazarAbajo = async () => {
    await nextTick()
    scrollContenedor.value?.scrollTo({ top: scrollContenedor.value.scrollHeight, behavior: 'smooth' })
}

const abrirFormularioPropuesta = async () => {

    errorPropuesta.value = ''
    tipoOfertaSeleccionado.value = esProductoDeDonacion.value ? TipoOferta.SolicitudDonacion : TipoOferta.Trueque
    productoOfrecidoId.value = ''
    monto.value = null
    direccionMonto.value = DireccionMonto.ProponentePagaAlVendedor

    if (!esProductoDeDonacion.value) {
        try {
            const response = await ProductosService.obtenerMisProductos()
            misProductosDisponibles.value = (response.data.data as ProductoDTO[]).filter((p) => p.disponible)
        }
        catch (err) {
            console.error(err)
        }
    }

    mostrarFormularioPropuesta.value = true

}

const requiereProducto = computed(() =>
    tipoOfertaSeleccionado.value === TipoOferta.Trueque || tipoOfertaSeleccionado.value === TipoOferta.TruequeConDiferencia
)
const requiereMonto = computed(() =>
    tipoOfertaSeleccionado.value === TipoOferta.Compra || tipoOfertaSeleccionado.value === TipoOferta.TruequeConDiferencia
)

const enviarPropuesta = async () => {

    if (!chat.value) return

    if (requiereProducto.value && !productoOfrecidoId.value) {
        errorPropuesta.value = 'Selecciona uno de tus artículos para ofrecer.'
        return
    }
    if (requiereMonto.value && (!monto.value || monto.value <= 0)) {
        errorPropuesta.value = 'Indica un monto válido.'
        return
    }

    enviandoPropuesta.value = true
    errorPropuesta.value = ''

    try {
        const response = await PropuestasService.crear({
            chatId: chat.value.id,
            tipoOferta: tipoOfertaSeleccionado.value,
            productoOfrecidoId: requiereProducto.value ? productoOfrecidoId.value : null,
            monto: requiereMonto.value ? monto.value : null,
            direccionMonto: tipoOfertaSeleccionado.value === TipoOferta.TruequeConDiferencia ? direccionMonto.value : null,
            mensaje: mensajePropuesta.value
        })

        propuestas.value.unshift(response.data.data)
        mostrarFormularioPropuesta.value = false
        mensajePropuesta.value = ''
        await cargarMensajes()
        await desplazarAbajo()
    }
    catch (err: unknown) {
        console.error(err)
        const respuesta = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        errorPropuesta.value = respuesta || 'No fue posible enviar la oferta.'
    }
    finally {
        enviandoPropuesta.value = false
    }

}

const responderPropuesta = async (propuesta: PropuestaDTO, aceptar: boolean) => {

    try {
        await PropuestasService.responder(propuesta.id, aceptar)
        propuesta.estado = aceptar ? EstadoPropuesta.Aceptada : EstadoPropuesta.Rechazada
        await cargarMensajes()
        await desplazarAbajo()
    }
    catch (err) {
        console.error(err)
    }

}

const abrirCalificar = (propuesta: PropuestaDTO) => {
    propuestaParaCalificar.value = propuesta
    estrellas.value = 0
    comentario.value = ''
    calificacionEnviada.value = false
}

const enviarCalificacion = async () => {

    if (!propuestaParaCalificar.value || estrellas.value < 1) return

    enviandoCalificacion.value = true

    try {
        await CalificacionesService.crear({
            propuestaId: propuestaParaCalificar.value.id,
            estrellas: estrellas.value,
            comentario: comentario.value
        })
        propuestaParaCalificar.value.puedeCalificar = false
        calificacionEnviada.value = true
    }
    catch (err) {
        console.error(err)
    }
    finally {
        enviandoCalificacion.value = false
    }

}

const miRolEsVendedor = computed(() => chat.value?.esVendedor ?? null)

const esMensajePropio = (mensaje: MensajeDTO) => {
    if (miRolEsVendedor.value === null || mensaje.emisor === EmisorMensaje.Sistema) return false
    return (miRolEsVendedor.value && mensaje.emisor === EmisorMensaje.Vendedor) ||
        (!miRolEsVendedor.value && mensaje.emisor === EmisorMensaje.Comprador)
}

const formatearHora = (fechaIso: string) =>
    new Date(fechaIso).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <TopBar :titulo="chat?.nombreProductoSnapshot || 'Conversación'" />

        <div v-if="cargando" class="flex-1 flex items-center justify-center text-secondary">Cargando conversación...</div>

        <div v-else-if="!chat" class="flex-1 flex flex-col items-center justify-center gap-2 text-center px-margin-mobile">
            <span class="material-symbols-outlined text-[40px] text-secondary">chat_bubble</span>
            <p class="text-body-md text-secondary">No encontramos esta conversación en tu lista de mensajes.</p>
        </div>

        <template v-else>
            <div class="px-margin-mobile md:px-margin-desktop py-sm bg-surface-container-low flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-surface-container-lowest overflow-hidden flex items-center justify-center flex-shrink-0">
                    <img v-if="resolverUrlArchivo(chat.imagenProductoSnapshot)" :src="resolverUrlArchivo(chat.imagenProductoSnapshot) ?? ''" class="w-full h-full object-cover" alt="" />
                    <span v-else class="material-symbols-outlined text-secondary text-[18px]">image</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-body-sm text-on-surface truncate">{{ chat.nombreProductoSnapshot }}</p>
                    <p class="text-label-sm text-secondary">Intercambio: {{ etiquetaTipoTransaccion(chat.tipoTransaccionProductoSnapshot) }}</p>
                </div>
                <button
                    v-if="!chat.esVendedor && !tieneOfertaPendiente"
                    class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-container text-on-primary text-label-sm font-label-md flex-shrink-0"
                    @click="abrirFormularioPropuesta"
                >
                    <span class="material-symbols-outlined text-[16px]">{{ esProductoDeDonacion ? 'volunteer_activism' : 'sync_alt' }}</span>
                    {{ esProductoDeDonacion ? 'Pedir donación' : 'Proponer' }}
                </button>
            </div>

            <div ref="scrollContenedor" class="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-md space-y-3">

                <div v-if="mensajes.length === 0 && propuestas.length === 0" class="text-center text-secondary text-body-sm py-lg">
                    Aún no hay mensajes. ¡Escribe el primero!
                </div>

                <template v-for="mensaje in mensajes" :key="mensaje.id">
                    <div v-if="mensaje.emisor === EmisorMensaje.Sistema" class="flex justify-center">
                        <span class="text-label-sm text-secondary bg-surface-container-low rounded-full px-3 py-1 text-center">{{ mensaje.contenido }}</span>
                    </div>
                    <div v-else class="flex" :class="esMensajePropio(mensaje) ? 'justify-end' : 'justify-start'">
                        <div
                            class="max-w-[75%] rounded-2xl px-4 py-2.5 text-body-md"
                            :class="esMensajePropio(mensaje)
                                ? 'bg-primary-container text-on-primary rounded-br-sm'
                                : 'bg-surface-container-highest text-on-surface border border-outline-variant rounded-bl-sm'"
                        >
                            {{ mensaje.contenido }}
                            <span v-if="mensaje.tieneArchivos" class="flex items-center gap-1 text-label-sm opacity-80 mt-1">
                                <span class="material-symbols-outlined text-[14px]">attach_file</span>
                                Adjunto
                            </span>
                            <div class="text-[10px] opacity-70 text-right mt-0.5">{{ formatearHora(mensaje.fechaEnvio) }}</div>
                        </div>
                    </div>
                </template>

                <div
                    v-for="propuesta in propuestas"
                    :key="propuesta.id"
                    class="bg-surface-container-lowest rounded-xl product-card-shadow p-md space-y-3"
                >
                    <div class="flex items-center justify-between">
                        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">{{ etiquetaTipoOferta(propuesta.tipoOferta) }}</span>
                        <span
                            class="text-label-sm font-label-md px-2.5 py-1 rounded-full"
                            :class="{
                                'bg-surface-container text-secondary': propuesta.estado === EstadoPropuesta.Pendiente,
                                'bg-tertiary-container/20 text-tertiary': propuesta.estado === EstadoPropuesta.Aceptada,
                                'bg-error-container text-error': propuesta.estado === EstadoPropuesta.Rechazada,
                            }"
                        >
                            {{ propuesta.estado === EstadoPropuesta.Pendiente ? 'Pendiente' : propuesta.estado === EstadoPropuesta.Aceptada ? 'Aceptada' : 'Rechazada' }}
                        </span>
                    </div>

                    <template v-if="propuesta.tipoOferta === TipoOferta.Compra">
                        <div class="flex items-center gap-2 bg-surface-container-low rounded-lg p-2">
                            <img v-if="resolverUrlArchivo(propuesta.productoSolicitadoFoto)" :src="resolverUrlArchivo(propuesta.productoSolicitadoFoto) ?? ''" class="w-10 h-10 rounded object-cover" alt="" />
                            <span class="text-body-sm text-on-surface truncate flex-1">{{ propuesta.productoSolicitadoTitulo }}</span>
                            <span class="font-bold text-primary text-label-md flex-shrink-0">{{ formatearPrecio(propuesta.monto ?? 0) }}</span>
                        </div>
                    </template>
                    <template v-else-if="propuesta.tipoOferta === TipoOferta.SolicitudDonacion">
                        <div class="flex items-center gap-2 bg-surface-container-low rounded-lg p-2">
                            <span class="material-symbols-outlined text-primary">volunteer_activism</span>
                            <img v-if="resolverUrlArchivo(propuesta.productoSolicitadoFoto)" :src="resolverUrlArchivo(propuesta.productoSolicitadoFoto) ?? ''" class="w-10 h-10 rounded object-cover" alt="" />
                            <span class="text-body-sm text-on-surface truncate flex-1">{{ propuesta.productoSolicitadoTitulo }}</span>
                        </div>
                    </template>
                    <template v-else>
                        <div class="flex items-center gap-2">
                            <div class="flex-1 flex items-center gap-2 bg-surface-container-low rounded-lg p-2">
                                <img v-if="resolverUrlArchivo(propuesta.productoOfrecidoFoto)" :src="resolverUrlArchivo(propuesta.productoOfrecidoFoto) ?? ''" class="w-10 h-10 rounded object-cover" alt="" />
                                <span class="text-body-sm text-on-surface truncate">{{ propuesta.productoOfrecidoTitulo }}</span>
                            </div>
                            <span class="material-symbols-outlined text-secondary">sync_alt</span>
                            <div class="flex-1 flex items-center gap-2 bg-surface-container-low rounded-lg p-2">
                                <img v-if="resolverUrlArchivo(propuesta.productoSolicitadoFoto)" :src="resolverUrlArchivo(propuesta.productoSolicitadoFoto) ?? ''" class="w-10 h-10 rounded object-cover" alt="" />
                                <span class="text-body-sm text-on-surface truncate">{{ propuesta.productoSolicitadoTitulo }}</span>
                            </div>
                        </div>
                        <p v-if="propuesta.tipoOferta === TipoOferta.TruequeConDiferencia" class="text-center text-body-sm text-on-surface">
                            + <span class="font-bold text-primary">{{ formatearPrecio(propuesta.monto ?? 0) }}</span>
                            {{ propuesta.direccionMonto === DireccionMonto.ProponentePagaAlVendedor ? 'que pone el proponente' : 'que el proponente pide a cambio' }}
                        </p>
                    </template>

                    <p v-if="propuesta.mensaje" class="text-body-sm text-secondary">"{{ propuesta.mensaje }}"</p>

                    <div v-if="chat.esVendedor && propuesta.estado === EstadoPropuesta.Pendiente" class="flex gap-2">
                        <button class="flex-1 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-sm" @click="responderPropuesta(propuesta, false)">Rechazar</button>
                        <button class="flex-1 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-sm" @click="responderPropuesta(propuesta, true)">Aceptar</button>
                    </div>

                    <button
                        v-if="propuesta.puedeCalificar"
                        class="w-full py-2 rounded-lg border border-primary text-primary font-label-md text-label-sm flex items-center justify-center gap-1"
                        @click="abrirCalificar(propuesta)"
                    >
                        <span class="material-symbols-outlined text-[16px]">star</span>
                        Calificar al vendedor
                    </button>
                </div>
            </div>

            <div v-if="mostrarFormularioPropuesta" class="border-t border-outline-variant bg-surface-container-lowest px-margin-mobile md:px-margin-desktop py-md space-y-3 max-h-[70vh] overflow-y-auto">
                <div class="flex justify-between items-center">
                    <h3 class="font-label-md text-label-md text-on-surface">{{ esProductoDeDonacion ? 'Pedir la donación' : 'Nueva oferta' }}</h3>
                    <button class="text-secondary" @click="mostrarFormularioPropuesta = false">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <template v-if="esProductoDeDonacion">
                    <div class="flex items-center gap-2 p-3 rounded-lg bg-primary-container/10 border border-primary-container/20">
                        <span class="material-symbols-outlined text-primary">volunteer_activism</span>
                        <p class="text-body-sm text-on-surface">
                            Este artículo es una donación. Le vas a pedir al vendedor que te lo done a ti; él puede aceptar o rechazar tu solicitud.
                        </p>
                    </div>
                </template>

                <div v-else class="flex gap-2">
                    <button
                        type="button"
                        class="flex-1 py-2 rounded-lg border text-label-sm font-label-md transition-all"
                        :class="tipoOfertaSeleccionado === TipoOferta.Trueque ? 'border-primary bg-primary-container/10 text-primary' : 'border-outline-variant text-secondary'"
                        @click="tipoOfertaSeleccionado = TipoOferta.Trueque"
                    >Trueque</button>
                    <button
                        type="button"
                        class="flex-1 py-2 rounded-lg border text-label-sm font-label-md transition-all"
                        :class="tipoOfertaSeleccionado === TipoOferta.Compra ? 'border-primary bg-primary-container/10 text-primary' : 'border-outline-variant text-secondary'"
                        @click="tipoOfertaSeleccionado = TipoOferta.Compra"
                    >Comprar</button>
                    <button
                        type="button"
                        class="flex-1 py-2 rounded-lg border text-label-sm font-label-md transition-all"
                        :class="tipoOfertaSeleccionado === TipoOferta.TruequeConDiferencia ? 'border-primary bg-primary-container/10 text-primary' : 'border-outline-variant text-secondary'"
                        @click="tipoOfertaSeleccionado = TipoOferta.TruequeConDiferencia"
                    >Trueque + $</button>
                </div>

                <div v-if="requiereProducto" class="space-y-2">
                    <label class="font-label-md text-label-sm text-on-surface-variant">Tu artículo a ofrecer</label>
                    <div v-if="misProductosDisponibles.length === 0" class="text-body-sm text-secondary">
                        No tienes artículos disponibles para ofrecer. Publica uno primero.
                    </div>
                    <div v-else class="space-y-2 max-h-32 overflow-y-auto">
                        <label
                            v-for="p in misProductosDisponibles" :key="p.id"
                            class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer"
                            :class="productoOfrecidoId === p.id ? 'border-primary bg-primary-container/10' : 'border-outline-variant'"
                        >
                            <input v-model="productoOfrecidoId" type="radio" :value="p.id" class="accent-primary" />
                            <span class="text-body-sm text-on-surface truncate">{{ p.titulo }}</span>
                        </label>
                    </div>
                </div>

                <div v-if="requiereMonto" class="space-y-2">
                    <label class="font-label-md text-label-sm text-on-surface-variant">
                        {{ tipoOfertaSeleccionado === TipoOferta.Compra ? 'Monto que ofreces' : 'Diferencia en efectivo' }}
                    </label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                        <input
                            v-model.number="monto" type="number" min="0" step="0.01" placeholder="0.00"
                            class="w-full pl-8 pr-4 py-3 bg-surface-container-low border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-body-md"
                        />
                    </div>

                    <div v-if="tipoOfertaSeleccionado === TipoOferta.TruequeConDiferencia" class="flex flex-col gap-2">
                        <label
                            v-for="opcion in [DireccionMonto.ProponentePagaAlVendedor, DireccionMonto.VendedorPagaAlProponente]" :key="opcion"
                            class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer"
                            :class="direccionMonto === opcion ? 'border-primary bg-primary-container/10' : 'border-outline-variant'"
                        >
                            <input v-model="direccionMonto" type="radio" :value="opcion" class="accent-primary" />
                            <span class="text-body-sm text-on-surface">{{ etiquetaDireccionMonto(opcion) }}</span>
                        </label>
                    </div>
                </div>

                <textarea
                    v-model="mensajePropuesta" rows="2"
                    :placeholder="esProductoDeDonacion ? 'Cuéntale al vendedor por qué te gustaría recibirlo (opcional)' : 'Cuéntale al vendedor por qué es una buena oferta (opcional)'"
                    class="w-full px-3 py-2 bg-surface-container-low rounded-lg border-none outline-none text-body-sm resize-none"
                ></textarea>

                <p v-if="errorPropuesta" class="text-error text-body-sm">{{ errorPropuesta }}</p>

                <button
                    :disabled="enviandoPropuesta"
                    class="w-full py-3 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-60"
                    @click="enviarPropuesta"
                >
                    {{ enviandoPropuesta ? 'Enviando...' : (esProductoDeDonacion ? 'Pedir la donación' : 'Enviar oferta') }}
                </button>
            </div>

            <div v-if="propuestaParaCalificar" class="border-t border-outline-variant bg-surface-container-lowest px-margin-mobile md:px-margin-desktop py-md space-y-3">
                <div class="flex justify-between items-center">
                    <h3 class="font-label-md text-label-md text-on-surface">Calificar al vendedor</h3>
                    <button class="text-secondary" @click="propuestaParaCalificar = null">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div v-if="calificacionEnviada" class="text-tertiary text-body-sm">¡Gracias por tu calificación!</div>

                <template v-else>
                    <div class="flex items-center gap-1 justify-center py-2">
                        <button v-for="n in 5" :key="n" type="button" @click="estrellas = n">
                            <span
                                class="material-symbols-outlined text-[32px] text-primary"
                                :style="n <= estrellas ? { fontVariationSettings: `'FILL' 1` } : {}"
                            >star</span>
                        </button>
                    </div>
                    <textarea
                        v-model="comentario" rows="2" placeholder="Cuenta cómo fue tu experiencia (opcional)"
                        class="w-full px-3 py-2 bg-surface-container-low rounded-lg border-none outline-none text-body-sm resize-none"
                    ></textarea>
                    <button
                        :disabled="enviandoCalificacion || estrellas < 1"
                        class="w-full py-3 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-60"
                        @click="enviarCalificacion"
                    >
                        {{ enviandoCalificacion ? 'Enviando...' : 'Enviar calificación' }}
                    </button>
                </template>
            </div>

            <form class="flex items-center gap-2 px-margin-mobile md:px-margin-desktop py-sm border-t border-outline-variant bg-surface-container-lowest" @submit.prevent="enviarMensaje">
                <textarea
                    v-model="texto"
                    rows="1"
                    placeholder="Escribe un mensaje..."
                    class="flex-1 resize-none max-h-32 px-4 py-3 bg-surface-container-low rounded-xl border-none outline-none text-body-md focus:ring-2 focus:ring-primary/20"
                    @keydown.enter.exact.prevent="enviarMensaje"
                />
                <button
                    type="submit"
                    :disabled="enviando || !texto.trim()"
                    class="w-11 h-11 flex items-center justify-center rounded-full bg-primary-container text-on-primary disabled:opacity-50"
                >
                    <span class="material-symbols-outlined">send</span>
                </button>
            </form>
        </template>
    </div>
</template>
