<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AuthService from '../services/AuthService'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const correo = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const error = ref('')

const iniciarSesion = async () => {

    error.value = ''
    cargando.value = true

    try {
        const response = await AuthService.login({
            correo: correo.value,
            password: password.value
        })

        authStore.setToken(response.data.data)
        router.push('/home')
    }
    catch (err) {
        console.error(err)
        error.value = 'Correo o contraseña incorrectos.'
    }
    finally {
        cargando.value = false
    }

}
</script>

<template>
    <div class="bg-surface text-on-surface min-h-screen flex items-center justify-center p-margin-mobile md:p-md relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none z-0">
            <div class="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-[120px]"></div>
            <div class="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-tertiary-container/10 rounded-full blur-[120px]"></div>
        </div>

        <main class="w-full max-w-[1100px] grid md:grid-cols-2 bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-2xl relative z-10 md:min-h-[640px]">
            <div class="hidden md:flex flex-col justify-between p-lg relative overflow-hidden bg-primary-container">
                <div class="relative z-10">
                    <h1 class="text-on-primary font-headline-lg text-headline-lg mb-4">TrueQ</h1>
                    <p class="text-white/80 font-body-lg text-body-lg max-w-sm">La evolución del trueque. Intercambia lo que ya no usas por lo que realmente necesitas.</p>
                </div>
                <div class="relative z-10">
                    <div class="bg-white/10 backdrop-blur-md rounded-2xl p-md border border-white/20">
                        <div class="flex items-center gap-sm mb-base">
                            <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">eco</span>
                            <span class="text-white font-label-md text-label-md uppercase tracking-wider">Comunidad Sostenible</span>
                        </div>
                        <p class="text-white font-body-sm text-body-sm leading-relaxed">
                            Únete a la comunidad que está reduciendo su huella ambiental mediante el intercambio circular.
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex flex-col justify-center p-md md:p-lg lg:px-xl">
                <div class="max-w-md mx-auto w-full">
                    <header class="mb-lg">
                        <h2 class="font-headline-md text-headline-md text-on-surface mb-xs">Bienvenido de nuevo</h2>
                        <p class="font-body-md text-body-md text-secondary">Ingresa a tu cuenta para continuar intercambiando.</p>
                    </header>

                    <form class="space-y-md" @submit.prevent="iniciarSesion">
                        <div class="space-y-xs">
                            <label class="font-label-md text-label-md text-on-surface-variant block px-xs" for="email">Correo electrónico</label>
                            <div class="relative group">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">mail</span>
                                <input
                                    id="email"
                                    v-model="correo"
                                    type="email"
                                    required
                                    placeholder="nombre@ejemplo.com"
                                    class="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest focus:border-primary/30 transition-all text-body-md font-body-md outline-none"
                                />
                            </div>
                        </div>

                        <div class="space-y-xs">
                            <label class="font-label-md text-label-md text-on-surface-variant block px-xs" for="password">Contraseña</label>
                            <div class="relative group">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">lock</span>
                                <input
                                    id="password"
                                    v-model="password"
                                    :type="mostrarPassword ? 'text' : 'password'"
                                    required
                                    placeholder="••••••••"
                                    class="w-full pl-12 pr-12 py-4 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest focus:border-primary/30 transition-all text-body-md font-body-md outline-none"
                                />
                                <button
                                    type="button"
                                    class="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
                                    @click="mostrarPassword = !mostrarPassword"
                                >
                                    <span class="material-symbols-outlined">{{ mostrarPassword ? 'visibility_off' : 'visibility' }}</span>
                                </button>
                            </div>
                        </div>

                        <p v-if="error" class="text-error text-body-sm font-body-sm px-xs">{{ error }}</p>

                        <button
                            type="submit"
                            :disabled="cargando"
                            class="w-full bg-primary-container text-on-primary py-4 rounded-xl font-label-md text-label-md shadow-md hover:bg-primary transition-all active:scale-[0.98] mt-base disabled:opacity-60"
                        >
                            {{ cargando ? 'Ingresando...' : 'Iniciar Sesión' }}
                        </button>
                    </form>

                    <p class="text-center mt-xl text-body-sm font-body-sm text-secondary">
                        ¿No tienes una cuenta?
                        <a href="#" class="text-primary font-label-md hover:underline" @click.prevent="router.push('/register')">Regístrate gratis</a>
                    </p>
                </div>
            </div>
        </main>
    </div>
</template>
