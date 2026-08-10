import { defineStore } from "pinia"
import NotificacionesService from "../services/NotificacionesService"

export const useNotificacionesStore = defineStore("notificaciones", {

    state: () => ({

        noLeidas: 0

    }),

    actions: {

        async refrescarConteo() {

            try {
                const response = await NotificacionesService.contarNoLeidas()
                this.noLeidas = response.data.data
            }
            catch (err) {
                console.error(err)
            }

        }

    }

})
