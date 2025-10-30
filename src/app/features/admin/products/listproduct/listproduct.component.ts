import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../../core/service/producto.service';
import { ProductoDetalles } from '../../../../core/models/producto_detalles.model';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { TemporadaService } from '../../../../core/service/temporada.service';
import { Temporada } from '../../../../core/models/temporada.model';


@Component({
  selector: 'app-listproduct',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listproduct.component.html',
  styleUrls: ['./listproduct.component.css']
})

export class Listproduct implements OnInit, OnDestroy {
  productos: ProductoDetalles[] = [];
  categorias: Categoria_producto[] = [];
  temporadas: Temporada[] = [];
  paginaActual = 1;
  tamanioPagina = 5;
  totalPaginas = 1;
  filtroBusqueda = '';
  filtroCategoria = '';
  filtroTemporada = '';
  infoSeleccionada: string | null = null;
  descripcionSeleccionada: string | null = null;
  ModalBorrar = false;
  productoABorrar: ProductoDetalles | null = null;
  mostrarModalMensaje = false;
  mensaje = '';
  esError = false;
  private closeTimer: any;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaProductoService,
    private temporadaService: TemporadaService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarTemporadas();
    this.cargarProductos();
  }

  private cargarProductos(): void {
    this.productoService.getAllDetallesCompletos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.calcularTotalPaginas();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  private cargarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter(cat => cat.tipo === 'principal');
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  private cargarTemporadas(): void {
    this.temporadaService.getAll().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.temporadas = response.data;
        }
      },
      error: (err) => console.error('Error al cargar temporadas:', err)
    });
  }

  private calcularTotalPaginas(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.productos.length / this.tamanioPagina));
  }

  get productosPaginados(): ProductoDetalles[] {
    let filtrados = this.aplicarFiltros();
    this.actualizarPaginacion(filtrados.length);
    return this.paginar(filtrados);
  }


  // Filtros 
  private aplicarFiltros(): ProductoDetalles[] {
    return this.productos
      .filter(p => this.filtrarPorBusqueda(p))
      .filter(p => this.filtrarPorCategoria(p))
      .filter(p => this.filtrarPorTemporada(p));
  }

  private filtrarPorBusqueda(producto: ProductoDetalles): boolean {
    if (!this.filtroBusqueda.trim()) return true;
    return producto.nombre?.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
  }

  private filtrarPorCategoria(producto: ProductoDetalles): boolean {
    if (!this.filtroCategoria) return true;
    const categoriaSeleccionada = this.categorias.find(cat => cat.id === Number(this.filtroCategoria));
    return categoriaSeleccionada ? producto.nombre_categoria === categoriaSeleccionada.nombre : true;
  }

  private filtrarPorTemporada(producto: ProductoDetalles): boolean {
    if (!this.filtroTemporada) return true;
    const temporadaSeleccionada = this.temporadas.find(temp => temp.id === Number(this.filtroTemporada));
    return temporadaSeleccionada ? producto.nombre_temporada === temporadaSeleccionada.nombre : true;
  }

  private actualizarPaginacion(totalFiltrados: number): void {
    this.totalPaginas = Math.max(1, Math.ceil(totalFiltrados / this.tamanioPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = 1;
  }

  private paginar(productos: ProductoDetalles[]): ProductoDetalles[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    return productos.slice(inicio, inicio + this.tamanioPagina);
  }

  // Modal para eliminar producto
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
    if (!this.productoABorrar) return;
    
    const nombreProducto = this.productoABorrar.nombre;
    const idProducto = this.productoABorrar.id;
    
    this.productoService.delete(idProducto).subscribe({
      next: () => this.onBorradoExitoso(nombreProducto),
      error: () => this.onBorradoError()
    });
  }
  
  // Manejo de modales y mensajes
  private onBorradoExitoso(nombreProducto: string): void {
    this.productos = this.productos.filter(p => p.id !== this.productoABorrar!.id);
    this.calcularTotalPaginas();
    this.cerrarModalBorrar();
    this.mostrarMensaje(`El producto "${nombreProducto}" ha sido eliminado exitosamente.`, false);
  }

  private onBorradoError(): void {
    this.cerrarModalBorrar();
    this.mostrarMensaje('Error al eliminar el producto. Por favor, intenta nuevamente.', true);
  }

  private cerrarModalBorrar(): void {
    this.ModalBorrar = false;
    this.productoABorrar = null;
  }

  private mostrarMensaje(mensaje: string, esError: boolean = false): void {
    this.mensaje = mensaje;
    this.esError = esError;
    this.mostrarModalMensaje = true;
    this.programarCierreModal();
  }

  private programarCierreModal(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.cerrarModal(), 3000);
  }

  cerrarModal(): void {
    this.mostrarModalMensaje = false;
    this.mensaje = '';
    this.esError = false;
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
  
  //Metodos de paginacion
  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  
  //Metodos de paginacion
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

  ngOnDestroy(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}