import api from "./api"

export default {

    obtenerNotificaciones(pagina: number = 0) {
        return api.get("/Notificaciones/Obtener", { params: { pagina } })
    },

    contarNoLeidas() {
        return api.get("/Notificaciones/ContarNoLeidas")
    },

    marcarLeida(id: number) {
        return api.post(`/Notificaciones/MarcarLeida/${id}`)
    },

    marcarTodasLeidas() {
        return api.post("/Notificaciones/MarcarTodasLeidas")
    }

}
