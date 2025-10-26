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
    private readonly api_url_detalles = environment.API_URL + '/productos/detalles';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Producto[]> {
        return this.http.get<Producto[]>(this.api_url);
    }

    // Método que usa el endpoint /productos/completos con estructura {success, data}
    getAllDetallesCompletos(): Observable<ProductoDetalles[]> {
        return this.http.get<any>(this.api_url_completos)
            .pipe(
                map(response => response?.data || [])
            );
    }

    getAllDetalles(): Observable<ProductoDetalles[]> {
        return this.http.get<any>(this.api_url_detalles).pipe(
            map(response => response?.data || [])
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

    getDetallesById(id: number): Observable<ProductoDetalles> {
        return this.http.get<any>(`${this.api_url}/detalles/${id}`).pipe(
            map(response => response || {})
        );
    }

}