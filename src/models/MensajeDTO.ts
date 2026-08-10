// Objetos en vez de `enum` (el proyecto compila con erasableSyntaxOnly)
export const EmisorMensaje = {
    Sistema: 0,
    Vendedor: 1,
    Comprador: 2,
} as const
export type EmisorMensaje = typeof EmisorMensaje[keyof typeof EmisorMensaje]

export const EstadoMensaje = {
    Enviado: 0,
    Leido: 1,
} as const
export type EstadoMensaje = typeof EstadoMensaje[keyof typeof EstadoMensaje]

export interface MensajeDTO {
    id: number;
    contenido: string;
    fechaEnvio: string;
    emisor: EmisorMensaje;
    estado: EstadoMensaje;
    tieneArchivos: boolean;
}
