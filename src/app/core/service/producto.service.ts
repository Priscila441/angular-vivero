import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Producto } from "../models/producto.model";
import { ProductoDetalles } from "../models/producto_detalles.model";
import { environment } from "../../../environments/environment.development";    

@Injectable({
    providedIn: 'root'
})

export class ProductoService {
    private readonly api_url = environment.API_URL + '/productos';
    private readonly api_url_completos = environment.API_URL + '/productos/completos';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Producto[]> {
        return this.http.get<Producto[]>(this.api_url);
    }

    getAllDetalles(): Observable<ProductoDetalles[]> {
        return this.http.get<{ success: boolean; data: ProductoDetalles[] }>(this.api_url_completos)
            .pipe(
                map(response => response.data)
            );
    }

    getById(id : number): Observable<Producto>{
        return this.http.get<Producto>(`${this.api_url}/${id}`);
    }

    create(producto:Producto ): Observable<Producto>{
        return this.http.post<Producto>(this.api_url, producto);
    }

    update(id: number, producto: Producto): Observable<Producto>{
        return this.http.put<Producto>(`${this.api_url}/${id}`, producto);
    }

    partialUpdate(id: number, producto: Partial<Producto>): Observable<void> {
        return this.http.patch<void>(`${this.api_url}/${id}`, producto);
    }

    delete(id: number): Observable<void>{
        return this.http.delete<void>(`${this.api_url}/${id}`);
    }

    getDetallesById(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.api_url + '/detalles'}/${id}`);
    }

}