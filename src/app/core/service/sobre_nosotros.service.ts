import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Sobre_nosotros } from '../models/sobre_nosotros.model';

@Injectable({ providedIn: 'root' })
export class SobreNosotrosService {
  private readonly api_url = `${environment.API_URL}/sobre-nosotros`;

  constructor(private http: HttpClient) {}

  getSobreNosotros(id = 1): Observable<{ success: boolean; data: Partial<Sobre_nosotros> }> {
    return this.http.get<{ success: boolean; data: Partial<Sobre_nosotros> }>(`${this.api_url}/${id}`);
  }

  updateSobreNosotros(payload: Partial<Sobre_nosotros>, id = 1) {
    // PUT según tu API
    return this.http.put<{ success: boolean; data: Sobre_nosotros }>(`${this.api_url}/${id}`, payload);
  }
}
