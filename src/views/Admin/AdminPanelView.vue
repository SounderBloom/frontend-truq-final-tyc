<script setup lang="ts">
import { ref } from 'vue'
import TopBar from '../../components/TopBar.vue'
import AdminUsuariosTab from './AdminUsuariosTab.vue'
import AdminCategoriasTab from './AdminCategoriasTab.vue'

const tabActiva = ref<'usuarios' | 'categorias'>('usuarios')
</script>

<template>
    <div class="min-h-screen pb-16">
        <TopBar titulo="Panel de administrador" />

        <main class="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-md space-y-md">
            <div class="flex gap-2 bg-surface-container-low rounded-xl p-1 w-fit">
                <button
                    class="px-4 py-2 rounded-lg font-label-md text-label-md transition-all"
                    :class="tabActiva === 'usuarios' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary'"
                    @click="tabActiva = 'usuarios'"
                >
                    Usuarios
                </button>
                <button
                    class="px-4 py-2 rounded-lg font-label-md text-label-md transition-all"
                    :class="tabActiva === 'categorias' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-secondary'"
                    @click="tabActiva = 'categorias'"
                >
                    Categorías
                </button>
            </div>

            <AdminUsuariosTab v-if="tabActiva === 'usuarios'" />
            <AdminCategoriasTab v-else />
        </main>
    </div>
</template>
