// src/app/core/services/categoria-servicio.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Categoria_servicio } from "../models/categoria_servicio.model";
import { environment } from "../../../environments/environment.development";

@Injectable({
  providedIn: "root"
})
export class CategoriaServicioService {
  private readonly api_url = environment.API_URL + "/categorias-servicios";

  constructor(private http: HttpClient) {}

  getAll(): Observable<Categoria_servicio[]> {
    return this.http.get<Categoria_servicio[]>(this.api_url);
  }

  getById(id: number): Observable<Categoria_servicio> {
    return this.http.get<Categoria_servicio>(`${this.api_url}/${id}`);
  }

  create(categoria: Categoria_servicio): Observable<Categoria_servicio> {
    return this.http.post<Categoria_servicio>(this.api_url, categoria);
  }

  update(id: number, categoria: Categoria_servicio): Observable<Categoria_servicio> {
    return this.http.put<Categoria_servicio>(`${this.api_url}/${id}`, categoria);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api_url}/${id}`);
  }
}
