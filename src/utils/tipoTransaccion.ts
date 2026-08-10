// Espejo del enum TipoTransaccion del backend (Data/Producto/TipoTransaccion.cs)
// (usamos un objeto en vez de `enum` porque el proyecto compila con
// erasableSyntaxOnly, que no permite enums con valor en tiempo de ejecución)
export const TipoTransaccion = {
    Trueque: 0,
    Venta: 1,
    TruequeOVenta: 2,
    Donar: 3,
} as const

export type TipoTransaccion = typeof TipoTransaccion[keyof typeof TipoTransaccion]

export function etiquetaTipoTransaccion(tipo: number): string {
    switch (tipo) {
        case TipoTransaccion.Trueque: return "Trueque"
        case TipoTransaccion.Venta: return "Venta"
        case TipoTransaccion.TruequeOVenta: return "Trueque o Venta"
        case TipoTransaccion.Donar: return "Donación"
        default: return "Trueque"
    }
}

export function formatearPrecio(precio: number): string {
    return precio.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })
}

export function formatearFechaRelativa(fechaIso: string): string {

    const fecha = new Date(fechaIso)
    const ahora = new Date()
    const diffMs = ahora.getTime() - fecha.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return "Ahora"
    if (diffMin < 60) return `Hace ${diffMin} min`

    const diffHoras = Math.floor(diffMin / 60)
    if (diffHoras < 24) return `Hace ${diffHoras} h`

    const diffDias = Math.floor(diffHoras / 24)
    if (diffDias === 1) return "Ayer"
    if (diffDias < 7) return `Hace ${diffDias} días`

    return fecha.toLocaleDateString("es-MX", { day: "numeric", month: "short" })

}

export function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {

    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c

}
