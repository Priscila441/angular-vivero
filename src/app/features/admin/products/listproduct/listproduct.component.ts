import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../../core/service/producto.service';
import { ProductoDetalles } from '../../../../core/models/producto_detalles.model';


@Component({
  selector: 'app-listproduct',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listproduct.component.html',
  styleUrls: ['./listproduct.component.css']
})

export class Listproduct implements OnInit {
  productos: ProductoDetalles[] = [];
  paginaActual: number = 1;
  tamanioPagina: number = 5;
  totalPaginas: number = 1;
  infoSeleccionada: string | null = null;
  descripcionSeleccionada: string | null = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.productoService.getAllDetalles().subscribe((data: ProductoDetalles[]) => {
      this.productos = data;
      this.totalPaginas = Math.max(1, Math.ceil(this.productos.length / this.tamanioPagina));
    });
  }

  get productosPaginados(): ProductoDetalles[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    return this.productos.slice(inicio, inicio + this.tamanioPagina);
  }

  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  // Métodos para la lógica del paginador
  get numerosPaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  esPaginaActual(numeroPagina: number): boolean {
    return this.paginaActual === numeroPagina;
  }

  irAPagina(numeroPagina: number): void {
    if (numeroPagina >= 1 && numeroPagina <= this.totalPaginas) {
      this.paginaActual = numeroPagina;
    }
  }

  get esPrimeraPagina(): boolean {
    return this.paginaActual === 1;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual === this.totalPaginas;
  }
}