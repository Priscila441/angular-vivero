import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/ApiResponse.models';
import { Encargado } from '../models/encargado.models';


@Injectable({ providedIn: 'root' })
export class EncargadoService {
  private readonly api_url = `${environment.API_URL}/encargado`;

  constructor(private http: HttpClient) {}

  getEncargado(id: number): Observable<Encargado> {
  return this.http.get<ApiResponse<Encargado>>(`${this.api_url}/${id}`).pipe(
    map((resp) => this.unwrapResponse<Encargado>(resp))
  );
}

  updateEncargado(id: number, cambios: Partial<Encargado>) {
    return this.http.put<ApiResponse<Encargado>>(`${this.api_url}/${id}`, cambios).pipe(
      map((resp) => this.unwrapResponse<Encargado>(resp))
    );
  }

  private unwrapResponse<T>(resp: any): T {
  if (!resp.success) {
    throw new Error(resp.message || 'Error en el backend');
  }

  return resp.data as T;
}

}
