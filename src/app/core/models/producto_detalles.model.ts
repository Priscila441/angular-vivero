export interface ImagenProducto {
    id: number;
    url: string;
    es_principal: boolean;
    orden: number;
}

export interface Categoria {
    id: number;
    nombre: string;
}

export interface Temporada {
    id: number;
    nombre: string;
}

export interface ProductoDetalles {
    id: number;
    nombre: string;
    descripcion: string;
    informacion_extra: string;
    esta_activo: boolean;
    categoria_id: number;
    temporada_id: number;
    categoria: Categoria;
    temporada: Temporada;
    imagenes: ImagenProducto[];
}
