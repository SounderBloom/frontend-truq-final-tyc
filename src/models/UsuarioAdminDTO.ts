export interface UsuarioAdminDTO {
    id: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    correo: string
    rol: string
    activo: boolean
    fechaRegistro: string
}

export interface CambiarRolDTO {
    rol: number
}

// Espejo del enum Rol del backend (Data/Auth/Rol.cs)
export const Rol = {
    Usuario: 0,
    Administrador: 1,
} as const
export type Rol = typeof Rol[keyof typeof Rol]
