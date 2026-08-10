<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AuthService from '../services/AuthService'
import { URL_TERMINOS_Y_CONDICIONES, URL_AVISO_DE_PRIVACIDAD } from '../utils/legal'

const router = useRouter()

const nombre = ref('')
const apellidoPaterno = ref('')
const apellidoMaterno = ref('')
const correo = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const aceptaTerminos = ref(false)
const cargando = ref(false)
const error = ref('')
const mensajeExito = ref('')

const registrar = async () => {

    error.value = ''
    mensajeExito.value = ''

    if (!aceptaTerminos.value) {
        error.value = 'Debes aceptar los Términos y Condiciones y el Aviso de Privacidad para continuar.'
        return
    }

    cargando.value = true

    try {
        const response = await AuthService.register({
            nombre: nombre.value,
            apellidoPaterno: apellidoPaterno.value,
            apellidoMaterno: apellidoMaterno.value,
            correo: correo.value,
            password: password.value
        })

        mensajeExito.value = response.data.message || 'Cuenta creada correctamente.'
        setTimeout(() => router.push('/login'), 1200)
    }
    catch (err) {
        console.error(err)
        error.value = 'Ya existe un usuario con ese correo, o los datos son inválidos.'
    }
    finally {
        cargando.value = false
    }

}
</script>

<template>
    <div class="bg-surface text-on-surface min-h-screen flex items-center justify-center p-margin-mobile md:p-md relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none z-0">
            <div class="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-[120px]"></div>
            <div class="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-tertiary-container/10 rounded-full blur-[120px]"></div>
        </div>

        <main class="w-full max-w-[1100px] grid md:grid-cols-2 bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-2xl relative z-10 md:min-h-[680px]">
            <div class="hidden md:flex flex-col justify-between p-lg relative overflow-hidden bg-primary-container">
                <div class="relative z-10">
                    <span class="material-symbols-outlined text-white text-[32px]">swap_horiz</span>
                    <h1 class="text-on-primary font-headline-lg text-headline-lg mt-2 mb-4">TrueQ</h1>
                    <p class="text-white/80 font-body-lg text-body-lg max-w-sm">Únete a la comunidad de trueque más grande. Intercambia lo que ya no usas por lo que realmente necesitas. Sin dinero, solo conexión humana.</p>
                </div>
            </div>

            <div class="flex flex-col justify-center p-md md:p-lg lg:px-xl">
                <div class="max-w-md mx-auto w-full">
                    <header class="mb-lg">
                        <h2 class="font-headline-md text-headline-md text-on-surface mb-xs">Crea tu cuenta</h2>
                        <p class="font-body-md text-body-md text-secondary">Comienza tu viaje de intercambio hoy mismo.</p>
                    </header>

                    <form class="space-y-md" @submit.prevent="registrar">
                        <div class="grid grid-cols-2 gap-sm">
                            <div class="space-y-xs col-span-2">
                                <label class="font-label-md text-label-md text-on-surface-variant block px-xs" for="nombre">Nombre</label>
                                <div class="relative group">
                                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">person</span>
                                    <input id="nombre" v-model="nombre" type="text" required placeholder="Tu nombre"
                                        class="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest focus:border-primary/30 transition-all text-body-md font-body-md outline-none" />
                                </div>
                            </div>
                            <div class="space-y-xs">
                                <label class="font-label-md text-label-md text-on-surface-variant block px-xs" for="apellidoPaterno">Apellido paterno</label>
                                <input id="apellidoPaterno" v-model="apellidoPaterno" type="text" required placeholder="Paterno"
                                    class="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest focus:border-primary/30 transition-all text-body-md font-body-md outline-none" />
                            </div>
                            <div class="space-y-xs">
                                <label class="font-label-md text-label-md text-on-surface-variant block px-xs" for="apellidoMaterno">Apellido materno</label>
                                <input id="apellidoMaterno" v-model="apellidoMaterno" type="text" required placeholder="Materno"
                                    class="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest focus:border-primary/30 transition-all text-body-md font-body-md outline-none" />
                            </div>
                        </div>

                        <div class="space-y-xs">
                            <label class="font-label-md text-label-md text-on-surface-variant block px-xs" for="email">Correo electrónico</label>
                            <div class="relative group">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">mail</span>
                                <input id="email" v-model="correo" type="email" required placeholder="nombre@ejemplo.com"
                                    class="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest focus:border-primary/30 transition-all text-body-md font-body-md outline-none" />
                            </div>
                        </div>

                        <div class="space-y-xs">
                            <label class="font-label-md text-label-md text-on-surface-variant block px-xs" for="password">Contraseña</label>
                            <div class="relative group">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">lock</span>
                                <input id="password" v-model="password" :type="mostrarPassword ? 'text' : 'password'" required placeholder="••••••••"
                                    class="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest focus:border-primary/30 transition-all text-body-md font-body-md outline-none" />
                                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors" @click="mostrarPassword = !mostrarPassword">
                                    <span class="material-symbols-outlined">{{ mostrarPassword ? 'visibility_off' : 'visibility' }}</span>
                                </button>
                            </div>
                        </div>

                        <label class="flex items-start gap-3 px-xs cursor-pointer">
                            <input
                                v-model="aceptaTerminos" type="checkbox" required
                                class="mt-1 w-4 h-4 rounded accent-primary flex-shrink-0"
                            />
                            <span class="text-body-sm font-body-sm text-secondary">
                                He leído y acepto los
                                <a
                                    :href="URL_TERMINOS_Y_CONDICIONES" target="_blank" rel="noopener"
                                    class="text-primary font-label-md hover:underline"
                                    @click.stop
                                >Términos y Condiciones</a>
                                y el
                                <a
                                    :href="URL_AVISO_DE_PRIVACIDAD" target="_blank" rel="noopener"
                                    class="text-primary font-label-md hover:underline"
                                    @click.stop
                                >Aviso de Privacidad</a>
                                de TrueQ.
                            </span>
                        </label>

                        <p v-if="error" class="text-error text-body-sm font-body-sm px-xs">{{ error }}</p>
                        <p v-if="mensajeExito" class="text-tertiary text-body-sm font-body-sm px-xs">{{ mensajeExito }}</p>

                        <button type="submit" :disabled="cargando || !aceptaTerminos"
                            class="w-full bg-primary-container text-on-primary py-4 rounded-xl font-label-md text-label-md shadow-md hover:bg-primary transition-all active:scale-[0.98] mt-base disabled:opacity-60">
                            {{ cargando ? 'Creando cuenta...' : 'Registrarse' }}
                        </button>
                    </form>

                    <p class="text-center mt-xl text-body-sm font-body-sm text-secondary">
                        ¿Ya tienes cuenta?
                        <a href="#" class="text-primary font-label-md hover:underline" @click.prevent="router.push('/login')">Iniciar sesión</a>
                    </p>
                </div>
            </div>
        </main>
    </div>
</template>
