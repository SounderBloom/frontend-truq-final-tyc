export interface JwtClaims {
    nameIdentifier: string;
    nombre: string;
    correo: string;
    rol: string;
    expira: number | null;
}

const CLAIM_NAME_IDENTIFIER = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const CLAIM_EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

/**
 * Decodifica un JWT (sin validar la firma, eso lo hace el backend) para
 * poder leer los claims del usuario autenticado en el cliente. Se usa
 * como sustituto temporal de un endpoint "Mi perfil", que aún no existe.
 */
export function decodeJwt(token: string): JwtClaims | null {
    try {
        const payloadBase64 = token.split(".")[1]
        const payloadJson = decodeURIComponent(
            atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        )
        const payload = JSON.parse(payloadJson)

        return {
            nameIdentifier: payload[CLAIM_NAME_IDENTIFIER] ?? payload["nameid"] ?? "",
            nombre: payload[CLAIM_NAME] ?? payload["name"] ?? "",
            correo: payload[CLAIM_EMAIL] ?? payload["email"] ?? "",
            rol: payload[CLAIM_ROLE] ?? payload["role"] ?? "",
            expira: payload["exp"] ?? null,
        }
    }
    catch {
        return null
    }
}
