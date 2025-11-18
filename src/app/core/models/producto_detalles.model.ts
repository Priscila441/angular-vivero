export interface ImagenProducto {
    id: number;
    url: string;
    es_principal: boolean;
    es_ilustrativa: boolean;
    orden: number;
}


export interface ProductoDetalles {
    id: number;
    nombre: string;
    descripcion: string;
    informacion_extra: string;
    esta_activo: boolean;
    categoria_id: number;
    temporada_id: number;
    nombre_categoria: string;
    nombre_temporada: string;
    imagenes: ImagenProducto[];
}
