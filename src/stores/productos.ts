import { defineStore } from "pinia"
import type { ProductoDTO } from "../models/ProductoDTO"

// El backend no expone un endpoint para obtener un producto por Id
// (solo búsqueda paginada y "mis productos"), así que guardamos aquí los
// productos que ya se han visto en el feed/búsqueda/mis productos para
// poder mostrar la vista de detalle sin volver a pedirlos al servidor.
export const useProductosStore = defineStore("productos", {

    state: () => ({

        cache: {} as Record<string, ProductoDTO>

    }),

    getters: {

        obtenerPorId: (state) => (id: string): ProductoDTO | null =>
            state.cache[id] ?? null

    },

    actions: {

        guardar(productos: ProductoDTO[]) {

            productos.forEach((producto) => {
                this.cache[producto.id] = producto
            })

        }

    }

})
