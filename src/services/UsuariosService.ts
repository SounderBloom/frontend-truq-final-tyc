import api from "./api"

export default {

    miPerfil() {
        return api.get("/Usuarios/MiPerfil")
    },

    // --- Panel de administrador ---

    obtenerTodos() {
        return api.get("/Usuarios/ObtenerTodos")
    },

    cambiarRol(usuarioId: string, rol: number) {
        return api.post(`/Usuarios/CambiarRol/${usuarioId}`, { rol })
    }

}
