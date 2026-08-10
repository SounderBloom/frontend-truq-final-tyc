import axios from "axios"
import { useAuthStore } from "../stores/auth"

// Origen del backend (sin /api). Se usa también para resolver rutas
// estáticas como /Uploads/... que el backend expone con UseStaticFiles.
export const API_ORIGIN = "http://localhost:8080"

// OJO: no se fija un "Content-Type" por defecto aquí a propósito. axios ya
// pone "application/json" automáticamente cuando el body es un objeto plano,
// y cuando el body es un FormData (creación de productos, envío de mensajes
// con archivos) deja que el navegador ponga el boundary de multipart por su
// cuenta. Si se fuerza "application/json" a nivel de instancia, ese header
// pisa el que necesita el FormData y el backend recibe un body multipart
// con Content-Type: application/json -> [FromForm] no puede parsearlo y
// ASP.NET Core responde 400 Bad Request (fue justo lo que rompía "Publicar
// artículo").
const api = axios.create({
    baseURL: `${API_ORIGIN}/api`
})

api.interceptors.request.use((config) => {

    const authStore = useAuthStore()

    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config

})

api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error?.response?.status === 401) {
            const authStore = useAuthStore()
            authStore.logout()
        }

        return Promise.reject(error)

    }

)

/**
 * Resuelve una ruta relativa devuelta por el backend (p. ej.
 * "/Uploads/Productos/x.webp") a una URL absoluta contra el origen de la API.
 */
export function resolverUrlArchivo(ruta: string | null | undefined): string | null {

    if (!ruta)
        return null

    if (ruta.startsWith("http://") || ruta.startsWith("https://"))
        return ruta

    return `${API_ORIGIN}${ruta.startsWith("/") ? "" : "/"}${ruta}`

}

export default api
