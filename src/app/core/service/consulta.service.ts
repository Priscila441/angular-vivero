import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private productosConsultados: string[] = [];

  agregarProducto(nombre: string) {
    if (!this.productosConsultados.includes(nombre)) {
      this.productosConsultados.push(nombre);
    }
  }

  obtenerConsultas() {
    return this.productosConsultados;
  }

  hayConsultas(): boolean {
    return this.productosConsultados.length > 0;
  }

  limpiarConsultas() {
    this.productosConsultados = [];
  }
}
