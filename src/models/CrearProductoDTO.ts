import type { InsertarFotoProductoDTO } from "./InsertarFotoProductoDTO";

export interface CrearProductoDTO {
    titulo: string;
    precio: number;
    descripcion: string;
    categoriaId: number;
    tipoTransaccion: number;
    latitud: number;
    longitud: number;
    fotos: InsertarFotoProductoDTO[];
}