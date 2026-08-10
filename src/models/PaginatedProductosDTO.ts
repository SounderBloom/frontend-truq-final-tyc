import type { ProductoDTO } from "./ProductoDTO";

export interface PaginatedProductosDTO {
    productos: ProductoDTO[];
    paginaActual: number;
    cantidadPorPagina: number;
    totalRegistros: number;
    totalPaginas: number;
}
