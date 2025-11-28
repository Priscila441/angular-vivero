import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private keyProductos = 'consultas_productos';
  private keyServicios = 'consultas_servicios';

  private productosConsultados: string[] = [];
  private serviciosConsultados: string[] = [];

  constructor() {
    // Recuperar productos del sessionStorage
    const guardadosProductos = sessionStorage.getItem(this.keyProductos);
    if (guardadosProductos) {
      this.productosConsultados = JSON.parse(guardadosProductos);
    }

    // Recuperar servicios del sessionStorage
    const guardadosServicios = sessionStorage.getItem(this.keyServicios);
    if (guardadosServicios) {
      this.serviciosConsultados = JSON.parse(guardadosServicios);
    }
  }

  private guardar() {
    sessionStorage.setItem(this.keyProductos, JSON.stringify(this.productosConsultados));
    sessionStorage.setItem(this.keyServicios, JSON.stringify(this.serviciosConsultados));
  }

  // ✅ Método original: mantiene compatibilidad
  agregarProducto(nombre: string) {
    if (!this.productosConsultados.includes(nombre)) {
      this.productosConsultados.push(nombre);
      this.guardar();
    }
  }

  // ✅ Nuevo método: para servicios
  agregarServicio(nombre: string) {
    if (!this.serviciosConsultados.includes(nombre)) {
      this.serviciosConsultados.push(nombre);
      this.guardar();
    }
  }

  // ✅ Método original
  obtenerConsultas() {
    return this.productosConsultados;
  }

  // ✅ Nuevo método para obtener servicios
  obtenerConsultasServicios() {
    return this.serviciosConsultados;
  }

  // ✅ Método original, adaptado para ambos
  hayConsultas(): boolean {
    return (
      this.productosConsultados.length > 0 ||
      this.serviciosConsultados.length > 0
    );
  }

  // ✅ Método original, ahora limpia todo
  limpiarConsultas() {
    this.productosConsultados = [];
    this.serviciosConsultados = [];
    sessionStorage.removeItem(this.keyProductos);
    sessionStorage.removeItem(this.keyServicios);
  }

  
}
