import api from "./api"
import type { CrearMensajeDTO } from "../models/CrearMensajeDTO"

export default {

    obtenerListaChats(pagina: number = 0) {
        return api.get("/Chats/ObtenerListaChats", { params: { pagina } })
    },

    obtenerMensajes(chatId: string) {
        return api.get(`/Chats/ObtenerMensajes/${chatId}`)
    },

    crearChat(productoId: string) {
        return api.post(`/Chats/Crear/${productoId}`)
    },

    enviarMensaje(mensaje: CrearMensajeDTO) {

        const formData = new FormData()

        formData.append("ChatId", mensaje.chatId)
        formData.append("Mensaje", mensaje.mensaje)
        formData.append("EsSistema", String(mensaje.esSistema ?? false))

        ;(mensaje.archivos ?? []).forEach((archivo) => {
            formData.append("Archivos", archivo)
        })

        return api.post("/Chats/EnviarMensaje", formData)

    },

    borrarChat(chatId: string) {
        return api.delete(`/Chats/Borrar/${chatId}`)
    }

}
