export interface CalificacionDTO {
    id: number
    calificadorId: string
    calificadorNombre: string
    estrellas: number
    comentario: string
    fechaCreacion: string
}

export interface ResumenCalificacionesDTO {
    promedio: number
    total: number
    recientes: CalificacionDTO[]
}

export interface CrearCalificacionDTO {
    propuestaId: string
    estrellas: number
    comentario: string
}
