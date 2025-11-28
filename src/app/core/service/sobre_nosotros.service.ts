import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { map, Observable } from 'rxjs';
import { SobreNosotros } from '../models/sobre_nosotros.model';
import { ApiResponse } from '../models/ApiResponse.models';


@Injectable({ providedIn: 'root' })
export class SobreNosotrosService {
  private readonly api_url = `${environment.API_URL}/sobre-nosotros`;

  constructor(private http: HttpClient) {}

  getSobreNosotros(id: number): Observable<SobreNosotros> {
  return this.http.get<ApiResponse<SobreNosotros>>(`${this.api_url}/${id}`).pipe(
    map((resp) => this.unwrapResponse<SobreNosotros>(resp))
  );
}



  updateSobreNosotros(id: number, cambios: Partial<SobreNosotros>) {
    return this.http.put<ApiResponse<SobreNosotros>>(`${this.api_url}/${id}`, cambios).pipe(
      map((resp) => this.unwrapResponse<SobreNosotros>(resp))
    );
  }

  private unwrapResponse<T>(resp: any): T {
  if (!resp.success) {
    throw new Error(resp.message || 'Error en el backend');
  }

  return resp.data as T;
}

}
