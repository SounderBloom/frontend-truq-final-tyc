<script setup lang="ts">
import { ref, onMounted } from 'vue'

import UsuariosService from '../../services/UsuariosService'
import { useAuthStore } from '../../stores/auth'
import { Rol } from '../../models/UsuarioAdminDTO'

import type { UsuarioAdminDTO } from '../../models/UsuarioAdminDTO'

const authStore = useAuthStore()

const usuarios = ref<UsuarioAdminDTO[]>([])
const cargando = ref(true)
const error = ref('')
const actualizandoId = ref<string | null>(null)
const mensajePorUsuario = ref<Record<string, string>>({})

onMounted(cargar)

async function cargar() {

    cargando.value = true
    error.value = ''

    try {
        const response = await UsuariosService.obtenerTodos()
        usuarios.value = response.data.data
    }
    catch (err) {
        console.error(err)
        error.value = 'No fue posible cargar los usuarios. Verifica que tu cuenta tenga rol de administrador.'
    }
    finally {
        cargando.value = false
    }

}

const cambiarRol = async (usuario: UsuarioAdminDTO, nuevoRolTexto: string) => {

    const nuevoRol = nuevoRolTexto === 'Administrador' ? Rol.Administrador : Rol.Usuario
    actualizandoId.value = usuario.id
    mensajePorUsuario.value = { ...mensajePorUsuario.value, [usuario.id]: '' }

    try {
        await UsuariosService.cambiarRol(usuario.id, nuevoRol)
        usuario.rol = nuevoRolTexto
    }
    catch (err: unknown) {
        console.error(err)
        const respuesta = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        mensajePorUsuario.value = { ...mensajePorUsuario.value, [usuario.id]: respuesta || 'No fue posible cambiar el rol.' }
    }
    finally {
        actualizandoId.value = null
    }

}
</script>

<template>
    <section class="space-y-3">
        <div v-if="cargando" class="text-center py-lg text-secondary">Cargando usuarios...</div>
        <div v-else-if="error" class="text-center py-lg text-error text-body-sm">{{ error }}</div>
        <div v-else-if="usuarios.length === 0" class="text-center py-lg text-secondary">No hay usuarios registrados.</div>

        <div v-else class="bg-surface-container-lowest rounded-xl product-card-shadow overflow-hidden divide-y divide-outline-variant">
            <div v-for="usuario in usuarios" :key="usuario.id" class="p-md flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div class="flex-1 min-w-0">
                    <p class="font-label-md text-label-md text-on-surface truncate">
                        {{ usuario.nombre }} {{ usuario.apellidoPaterno }} {{ usuario.apellidoMaterno }}
                    </p>
                    <p class="text-body-sm text-secondary truncate">{{ usuario.correo }}</p>
                    <p v-if="mensajePorUsuario[usuario.id]" class="text-error text-body-sm mt-1">{{ mensajePorUsuario[usuario.id] }}</p>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                    <span
                        v-if="!usuario.activo"
                        class="px-2 py-1 rounded-full bg-error-container text-error text-label-sm font-label-md"
                    >Inactivo</span>

                    <span
                        v-if="usuario.id === authStore.usuario?.nameIdentifier"
                        class="text-label-sm text-secondary px-3 py-2"
                        title="No puedes cambiar tu propio rol"
                    >{{ usuario.rol }} (tú)</span>

                    <select
                        v-else
                        :value="usuario.rol"
                        :disabled="actualizandoId === usuario.id"
                        class="px-3 py-2 bg-surface-container-low rounded-lg border-none outline-none text-body-sm disabled:opacity-60"
                        @change="cambiarRol(usuario, ($event.target as HTMLSelectElement).value)"
                    >
                        <option value="Usuario">Usuario</option>
                        <option value="Administrador">Administrador</option>
                    </select>
                </div>
            </div>
        </div>
    </section>
</template>
