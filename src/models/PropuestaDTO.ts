export const EstadoPropuesta = {
    Pendiente: 0,
    Aceptada: 1,
    Rechazada: 2,
} as const
export type EstadoPropuesta = typeof EstadoPropuesta[keyof typeof EstadoPropuesta]

// Espejo de Data/Propuestas/TipoOferta.cs
export const TipoOferta = {
    Trueque: 0,
    Compra: 1,
    TruequeConDiferencia: 2,
    SolicitudDonacion: 3,
} as const
export type TipoOferta = typeof TipoOferta[keyof typeof TipoOferta]

// Espejo de Data/Propuestas/DireccionMonto.cs
export const DireccionMonto = {
    ProponentePagaAlVendedor: 0,
    VendedorPagaAlProponente: 1,
} as const
export type DireccionMonto = typeof DireccionMonto[keyof typeof DireccionMonto]

export interface PropuestaDTO {
    id: string
    chatId: string

    productoSolicitadoId: string
    productoSolicitadoTitulo: string
    productoSolicitadoFoto: string | null

    tipoOferta: TipoOferta
    productoOfrecidoId: string | null
    productoOfrecidoTitulo: string | null
    productoOfrecidoFoto: string | null

    monto: number | null
    direccionMonto: DireccionMonto | null

    proponenteId: string
    vendedorId: string
    mensaje: string
    estado: EstadoPropuesta
    fechaCreacion: string
    fechaResolucion: string | null
    puedeCalificar: boolean
}

export interface CrearPropuestaDTO {
    chatId: string
    tipoOferta: TipoOferta
    productoOfrecidoId?: string | null
    monto?: number | null
    direccionMonto?: DireccionMonto | null
    mensaje: string
}
