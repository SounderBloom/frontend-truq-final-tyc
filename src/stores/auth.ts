import { defineStore } from "pinia"
import { decodeJwt, type JwtClaims } from "../utils/jwt"

const STORAGE_KEY = "trueq_token"

export const useAuthStore = defineStore("auth", {

    state: () => ({

        token: localStorage.getItem(STORAGE_KEY) || ""

    }),

    getters: {

        // Antes solo comprobaba `!!token`, así que un token viejo o
        // expirado en localStorage seguía contando como "autenticado":
        // eso bloqueaba /login (soloInvitado) sin dar oportunidad de
        // volver a iniciar sesión hasta que alguna petición fallara con
        // 401. Ahora se valida el claim `exp` del JWT.
        estaAutenticado(): boolean {

            if (!this.token) return false

            const claims = decodeJwt(this.token)

            if (!claims || claims.expira === null) return !!claims

            return claims.expira * 1000 > Date.now()

        },

        usuario(): JwtClaims | null {

            return this.token ? decodeJwt(this.token) : null

        }

    },

    actions: {

        setToken(token: string) {

            this.token = token
            localStorage.setItem(STORAGE_KEY, token)

        },

        logout() {

            this.token = ""
            localStorage.removeItem(STORAGE_KEY)

        }

    }

})
