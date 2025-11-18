import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Contacto } from '../models/contacto.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ContactoService {

  private readonly api_url = `${environment.API_URL}/contacto`;

  constructor(private http: HttpClient) {}

  obtenerContacto(id: number): Observable<Contacto> {
    return this.http.get<any>(`${this.api_url}/${id}`).pipe(
      map((resp) => resp.data)
    );
  }
}
