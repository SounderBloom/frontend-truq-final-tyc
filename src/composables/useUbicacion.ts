import { ref } from "vue"

// Ubicación por defecto (CDMX) usada solo como último recurso si el
// navegador no soporta o el usuario no otorga el permiso de geolocalización.
const UBICACION_POR_DEFECTO = { latitud: 19.4326, longitud: -99.1332 }

export function useUbicacion() {

    const latitud = ref<number | null>(null)
    const longitud = ref<number | null>(null)
    const cargandoUbicacion = ref(true)
    const ubicacionDisponible = ref(false)

    const obtenerUbicacion = (): Promise<void> => {

        return new Promise((resolve) => {

            if (!navigator.geolocation) {
                latitud.value = UBICACION_POR_DEFECTO.latitud
                longitud.value = UBICACION_POR_DEFECTO.longitud
                ubicacionDisponible.value = false
                cargandoUbicacion.value = false
                resolve()
                return
            }

            navigator.geolocation.getCurrentPosition(

                (position) => {
                    latitud.value = position.coords.latitude
                    longitud.value = position.coords.longitude
                    ubicacionDisponible.value = true
                    cargandoUbicacion.value = false
                    resolve()
                },

                () => {
                    latitud.value = UBICACION_POR_DEFECTO.latitud
                    longitud.value = UBICACION_POR_DEFECTO.longitud
                    ubicacionDisponible.value = false
                    cargandoUbicacion.value = false
                    resolve()
                }

            )

        })

    }

    return { latitud, longitud, cargandoUbicacion, ubicacionDisponible, obtenerUbicacion }

}
