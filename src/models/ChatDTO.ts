import type { MensajeDTO } from "./MensajeDTO";

export interface ChatDTO {
    id: string;
    productoId: string | null;
    nombreProductoSnapshot: string;
    imagenProductoSnapshot: string;
    tipoTransaccionProductoSnapshot: number;
    urlFotoUsuario: string;
    ultimoMensaje: MensajeDTO | null;
    ultimoMovimiento: string;
    // true si quien consulta es el vendedor del producto de este chat.
    esVendedor: boolean;
}
