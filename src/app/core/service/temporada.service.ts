import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Temporada } from "../models/temporada.model";
import { environment } from "../../../environments/environment.development";    

@Injectable({
    providedIn: 'root'
})

export class TemporadaService {
    private readonly api_url = environment.API_URL + '/temporadas';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Temporada[]>{
        return this.http.get<Temporada[]>(this.api_url);
    }

    getById(id : number): Observable<Temporada>{
        return this.http.get<Temporada>(`${this.api_url}/${id}`);
    }

    create(temporada: Temporada): Observable<Temporada>{
        return this.http.post<Temporada>(this.api_url, temporada);
    }

    update(id: number, temporada: Temporada): Observable<Temporada>{
        return this.http.put<Temporada>(`${this.api_url}/${id}`, temporada);
    }

    delete(id: number): Observable<void>{
        return this.http.delete<void>(`${this.api_url}/${id}`);
    }
}