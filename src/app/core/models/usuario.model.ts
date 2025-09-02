export interface Usuario {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    rol: string;
    ultimo_login: Date;
    esta_activo: boolean;
}
