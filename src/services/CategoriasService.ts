import api from "./api"
import type { CategoriaDTO } from "../models/CategoriaDTO"

export default {

    obtenerTodas() {
        return api.get("/Categorias/ObtenerTodas")
    },

    crear(nombre: string) {
        return api.post("/Categorias/Crear", { nombre } satisfies Partial<CategoriaDTO>)
    },

    actualizar(id: number, nombre: string) {
        // El backend espera el nombre como string plano en el body ([FromBody] string nombre).
        return api.put(`/Categorias/Actualizar/${id}`, JSON.stringify(nombre), {
            headers: { "Content-Type": "application/json" }
        })
    },

    eliminar(id: number) {
        return api.delete(`/Categorias/Eliminar/${id}`)
    }

}
