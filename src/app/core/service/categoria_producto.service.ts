// src/app/core/services/categoria-producto.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Categoria_producto } from "../models/categoria_producto.models";
import { environment } from "../../../environments/environment.development";

@Injectable({
  providedIn: "root"
})
export class CategoriaProductoService {
  private readonly api_url = environment.API_URL + "/categorias";

  constructor(private http: HttpClient) {}

  getAll(): Observable<Categoria_producto[]> {
    return this.http.get<Categoria_producto[]>(this.api_url);
  }

  getById(id: number): Observable<Categoria_producto> {
    return this.http.get<Categoria_producto>(`${this.api_url}/${id}`);
  }

  create(categoria: Categoria_producto): Observable<Categoria_producto> {
    return this.http.post<Categoria_producto>(this.api_url, categoria);
  }

  update(id: number, categoria: Categoria_producto): Observable<Categoria_producto> {
    return this.http.put<Categoria_producto>(`${this.api_url}/${id}`, categoria);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api_url}/${id}`);
  }
}
