import api from "./api"
import type { CrearProductoDTO } from "../models/CrearProductoDTO"

export interface FiltrosBusquedaProductos {
    latitud: number
    longitud: number
    radio: number
    pagina?: number
    cantidadPorPagina?: number
    categoriaId?: number | null
    tipoTransaccion?: number | null
}

export default {

    obtenerCategorias() {
        return api.get("/Categorias/ObtenerTodas")
    },

    obtenerTiposTransaccion() {
        return api.get("/Productos/TiposTransaccion")
    },

    crearProducto(dto: CrearProductoDTO) {
        const formData = new FormData()

        formData.append("Titulo", dto.titulo)
        formData.append("Precio", dto.precio.toString())
        formData.append("Descripcion", dto.descripcion)
        formData.append("CategoriaId", dto.categoriaId.toString())
        formData.append("TipoTransaccion", dto.tipoTransaccion.toString())
        formData.append("Latitud", dto.latitud.toString())
        formData.append("Longitud", dto.longitud.toString())

        dto.fotos.forEach((foto, index) => {
            formData.append(`Fotos[${index}].Orden`, foto.orden.toString())
            formData.append(`Fotos[${index}].Foto`, foto.foto)
        })
        return api.post("/Productos/Crear", formData)
    },

    buscarProductos(filtros: FiltrosBusquedaProductos) {
        return api.get("/Productos/Buscar", {
            params: {
                latitud: filtros.latitud,
                longitud: filtros.longitud,
                radio: filtros.radio,
                pagina: filtros.pagina ?? 1,
                cantidadPorPagina: filtros.cantidadPorPagina ?? 20,
                categoriaId: filtros.categoriaId ?? undefined,
                tipoTransaccion: filtros.tipoTransaccion ?? undefined
            }
        })
    },

    obtenerMisProductos() {
        return api.get("/Productos/MisProductos")
    },

    obtenerPorId(id: string) {
        return api.get(`/Productos/Obtener/${id}`)
    },

    eliminarProducto(productoId: string) {
        return api.delete("/Productos/Eliminar", { params: { ProductoId: productoId } })
    }

}
