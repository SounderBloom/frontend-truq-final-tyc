import { API_ORIGIN } from "../services/api"

// Los PDFs se sirven como archivos estáticos desde el propio backend
// (wwwroot/Legal), igual que las fotos de productos en /Uploads.
export const URL_TERMINOS_Y_CONDICIONES = `${API_ORIGIN}/Legal/TrueQ_Terminos_y_Condiciones.pdf`
export const URL_AVISO_DE_PRIVACIDAD = `${API_ORIGIN}/Legal/TrueQ_Aviso_de_Privacidad.pdf`
