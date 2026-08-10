export const TipoNotificacion = {
    Sistema: 0,
    MensajeNuevo: 1,
    PropuestaRecibida: 2,
    PropuestaRespondida: 3,
    CalificacionRecibida: 4,
} as const
export type TipoNotificacion = typeof TipoNotificacion[keyof typeof TipoNotificacion]

export interface NotificacionDTO {
    id: number
    titulo: string
    contenido: string
    leida: boolean
    tipo: TipoNotificacion
    referenciaId: string | null
    fechaCreacion: string
    urlImagenIcono: string
}
