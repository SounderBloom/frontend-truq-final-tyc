import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import BuscarView from '../views/BuscarView.vue'
import MisChatsView from '../views/MisChatsView.vue'
import ChatConversacionView from '../views/ChatConversacionView.vue'
import NotificacionesView from '../views/NotificacionesView.vue'
import PerfilView from '../views/PerfilView.vue'
import NuevoProductoView from '../views/Productos/NuevoProductoView.vue'
import DetalleProductoView from '../views/Productos/DetalleProductoView.vue'
import AdminPanelView from '../views/Admin/AdminPanelView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/login',
            component: LoginView,
            meta: { soloInvitado: true }
        },
        {
            path: '/register',
            component: RegisterView,
            meta: { soloInvitado: true }
        },
        {
            path: '/home',
            component: HomeView,
            meta: { requiereAuth: true }
        },
        {
            path: '/buscar',
            component: BuscarView,
            meta: { requiereAuth: true }
        },
        {
            path: '/mensajes',
            component: MisChatsView,
            meta: { requiereAuth: true }
        },
        {
            // Alias por compatibilidad con la ruta original
            path: '/mis-chats',
            redirect: '/mensajes'
        },
        {
            path: '/mensajes/:chatId',
            component: ChatConversacionView,
            meta: { requiereAuth: true },
            props: true
        },
        {
            path: '/notificaciones',
            component: NotificacionesView,
            meta: { requiereAuth: true }
        },
        {
            path: '/perfil',
            component: PerfilView,
            meta: { requiereAuth: true }
        },
        {
            path: '/productos/nuevo',
            component: NuevoProductoView,
            meta: { requiereAuth: true }
        },
        {
            path: '/productos/:id',
            component: DetalleProductoView,
            meta: { requiereAuth: true },
            props: true
        },
        {
            path: '/admin',
            component: AdminPanelView,
            meta: { requiereAuth: true, requiereAdmin: true }
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/home'
        }
    ]
})

router.beforeEach((to) => {

    const authStore = useAuthStore()

    if (to.meta.requiereAuth && !authStore.estaAutenticado) {
        return '/login'
    }

    if (to.meta.soloInvitado && authStore.estaAutenticado) {
        return '/home'
    }

    if (to.meta.requiereAdmin && authStore.usuario?.rol !== 'Administrador') {
        return '/home'
    }

    return true

})

export default router
