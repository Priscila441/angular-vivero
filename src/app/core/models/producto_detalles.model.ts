export interface ImagenProducto {
    id: number;
    url: string;
    es_principal: boolean;
    orden: number;
}

export interface ProductoDetalles {
    nombre: string;
    descripcion: string;
    informacion_extra: string;
    nombre_categoria: string;
    nombre_temporada: string;
    imagenes: ImagenProducto[];
}
