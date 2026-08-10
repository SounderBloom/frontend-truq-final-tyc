import api from "./api"
import type { CrearCalificacionDTO } from "../models/CalificacionDTO"

export default {

    crear(dto: CrearCalificacionDTO) {
        return api.post("/Calificaciones/Crear", dto)
    },

    obtenerDeUsuario(usuarioId: string) {
        return api.get(`/Calificaciones/ObtenerDeUsuario/${usuarioId}`)
    }

}
