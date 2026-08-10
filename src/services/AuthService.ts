import api from "./api";
import type { LoginDTO } from "../models/LoginDTO";
import type { RegisterDTO } from "../models/RegisterDTO";

export default{
    login(login:LoginDTO){
        return api.post("/Auth/Login",login);
    },

    register(register:RegisterDTO){
        return api.post("/Auth/Register",register);
    }
}