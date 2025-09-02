import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Producto } from "../models/producto.model";
import { environment } from "../../../environments/environment.development";    

@Injectable({
    providedIn: 'root'
})

export class ProductoService {
    private readonly api_url = environment.API_URL + '/productos';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Producto[]>{
        return this.http.get<Producto[]>(this.api_url);
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

    delete(id: number): Observable<void>{
        return this.http.delete<void>(`${this.api_url}/${id}`);
    }
}