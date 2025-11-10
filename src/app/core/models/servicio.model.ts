export interface Servicio {
    data: Servicio | null;
    id: number;
    nombre: string;
    descripcion: string;
    informacion_extra: string;
    esta_activo: boolean;
    imagenes: imagenServicio[];
    categoria_id: number;
}

export interface imagenServicio {
    id : number;
    url: string;
    public_id?: string;
    es_principal: boolean;
    orden: number;
}
