export interface ProductoDTO {
    id: string;
    titulo: string;
    precio: number;
    descripcion: string;
    disponible: boolean;
    fechaPublicacion: string;
    tipoTransaccion: number;
    vendedorId: string;
    categoriaId: number;
    nombreCategoria: string | null;
    latitud: number;
    longitud: number;
    // Rutas publicas (p. ej. "/Uploads/Productos/x.webp") ordenadas.
    fotos: string[];
}
