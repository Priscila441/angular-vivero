import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, tap } from "rxjs";
import { Servicio } from "../models/servicio.model";
import { environment } from "../../../environments/environment.development";

@Injectable({
    providedIn: 'root'
})

export class ServicioService {
    private readonly api_url = environment.API_URL + '/servicios';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Servicio[]>{
        return this.http.get<Servicio[]>(this.api_url);
    }   
    getById(id : number): Observable<Servicio>{
        return this.http.get<Servicio>(`${this.api_url}/${id}`);
    }
    create(servicio:Servicio ): Observable<Servicio>{
        return this.http.post<Servicio>(this.api_url, servicio);
    }
    update(id: number, servicio: Servicio): Observable<Servicio>{
        return this.http.put<Servicio>(`${this.api_url}/${id}`, servicio);
    }
    delete(id: number): Observable<void>{
        return this.http.delete<void>(`${this.api_url}/${id}`);
    }

    getDetallesById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api_url}/detalles/${id}`).pipe(
        tap(res => console.log('📦 Respuesta backend:', res)),
        map(response => response || {}));
    }

    getAllDetalles(): Observable<any> {
    return this.http.get<any>(`${this.api_url}/detalles`);
    }

    uploadImagenes(servicioId: number, formData: FormData): Observable<any> {
        return this.http.post<any>(`${environment.API_URL}/servicios/${servicioId}/imagenes/multiples`, formData);
    }
}