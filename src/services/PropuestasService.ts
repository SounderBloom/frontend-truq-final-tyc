import api from "./api"
import type { CrearPropuestaDTO } from "../models/PropuestaDTO"

export default {

    crear(dto: CrearPropuestaDTO) {
        return api.post("/Propuestas/Crear", dto)
    },

    obtenerPorChat(chatId: string) {
        return api.get(`/Propuestas/ObtenerPorChat/${chatId}`)
    },

    responder(propuestaId: string, aceptar: boolean) {
        return api.post(`/Propuestas/Responder/${propuestaId}`, { aceptar })
    },

    pendientesDeCalificar() {
        return api.get("/Propuestas/PendientesDeCalificar")
    }

}
