export interface CrearMensajeDTO {
    chatId: string;
    mensaje: string;
    esSistema?: boolean;
    archivos?: File[];
}
