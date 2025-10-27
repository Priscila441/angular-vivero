import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../../core/service/producto.service';
import { ProductoDetalles } from '../../../../core/models/producto_detalles.model';


@Component({
  selector: 'app-listproduct',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listproduct.component.html',
  styleUrls: ['./listproduct.component.css']
})

export class Listproduct implements OnInit, OnDestroy {
  productos: ProductoDetalles[] = [];
  paginaActual: number = 1;
  tamanioPagina: number = 5;
  totalPaginas: number = 1;
  infoSeleccionada: string | null = null;
  descripcionSeleccionada: string | null = null;
  filtroBusqueda: string = '';
  ModalBorrar: boolean = false;
  productoABorrar: ProductoDetalles | null = null;
  mostrarModalExito: boolean = false;
  mensajeExito: string = '';
  private temporizadorCierre: any;

  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productoService.getAllDetallesCompletos().subscribe((data: ProductoDetalles[]) => {
      this.productos = data;
      this.totalPaginas = Math.max(1, Math.ceil(this.productos.length / this.tamanioPagina));
    });
  }

  get productosPaginados(): ProductoDetalles[] {
    let filtrados = this.productos;
    if (this.filtroBusqueda.trim() !== '') {
      const filtro = this.filtroBusqueda.trim().toLowerCase();
      filtrados = this.productos.filter(p =>
        p.nombre?.toLowerCase().includes(filtro)
      );
    }
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    return filtrados.slice(inicio, inicio + this.tamanioPagina);
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

    borrarProducto(id: number): void {
      const producto = this.productos.find(p => p.id === id);
      if (producto) {
        this.productoABorrar = producto;
        this.ModalBorrar = true;
      }
    }

    cancelarBorrado(): void {
      this.ModalBorrar = false;
      this.productoABorrar = null;
    }

    confirmarBorrado(): void {
      if (this.productoABorrar === null) return;
      
      this.productoService.delete(this.productoABorrar.id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id !== this.productoABorrar!.id);
          this.totalPaginas = Math.max(1, Math.ceil(this.productos.length / this.tamanioPagina));
          this.ModalBorrar = false;
          this.productoABorrar = null;
          this.mostrarModal();
        },
        error: () => {
          alert('Error al eliminar el producto.');
          this.ModalBorrar = false;
          this.productoABorrar = null;
        }
      });
    }

  mostrarModal() {
    this.mensajeExito = 'Producto eliminado con éxito.';
    this.mostrarModalExito = true;
    this.cdr.detectChanges();
    
    if (this.temporizadorCierre) {
      clearTimeout(this.temporizadorCierre);
    }
    this.temporizadorCierre = setTimeout(() => this.cerrarModal(), 3000);
  }

  cerrarModal() {
    this.mostrarModalExito = false;
    if (this.temporizadorCierre) {
      clearTimeout(this.temporizadorCierre);
      this.temporizadorCierre = null;
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.temporizadorCierre) {
      clearTimeout(this.temporizadorCierre);
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