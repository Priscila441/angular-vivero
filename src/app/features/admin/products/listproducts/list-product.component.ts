import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductoService } from '../../../../core/service/producto.service';
import { ProductoDetalles } from '../../../../core/models/producto_detalles.model';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { TemporadaService } from '../../../../core/service/temporada.service';
import { Temporada } from '../../../../core/models/temporada.model';


@Component({
  selector: 'app-list-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './list-product.component.html',
  styleUrls: []
})

export class ListProductComponent implements OnInit, OnDestroy {
  productos: ProductoDetalles[] = [];
  categorias: Categoria_producto[] = [];
  subcategorias: Categoria_producto[] = [];
  temporadas: Temporada[] = [];


  private readonly coloresTemporadas: Record<number, string> = {
    1: 'bg-orange-100 text-orange-800',   
    2: 'bg-yellow-100 text-yellow-800',  
    3: 'bg-blue-100 text-blue-800',       
    4: 'bg-green-100 text-green-800',     
    5: 'bg-rose-100 text-rose-800'        
  };

  
  paginaActual = 1;
  tamanioPagina = 5;
  totalPaginas = 1;
  filtroBusqueda = '';
  filtroCategoria = '';
  filtroSubcategoria = '';
  filtroTemporada = '';
  mostrarSubcategorias = false;
  ModalBorrar = false;
  productoABorrar: ProductoDetalles | null = null;
  mostrarModalMensaje = false;
  mensaje = '';
  esError = false;
  private closeTimer: any;
  productosExpandidos: Set<number> = new Set();

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaProductoService,
    private temporadaService: TemporadaService,
    private router: Router
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
  this.normalizeProductos();
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
      next: (resp: any) => {
        // Soporta tanto un array directo como un objeto { data: [] }
        const lista = Array.isArray(resp) ? resp : (resp?.data || []);
        this.temporadas = lista;
        if (this.temporadas.length) this.normalizeProductos();
      },
      error: (err) => console.error('Error al cargar temporadas:', err)
    });
  }

  onCategoriaChange(): void {
    this.filtroSubcategoria = '';
    this.subcategorias = [];
    this.mostrarSubcategorias = false;
    // Si no hay categoría seleccionada, salir
    const categoriaId = Number(this.filtroCategoria);
    if (!categoriaId) return;
    // Verificar si la categoría tiene subcategorías (IDs 2 o 3)
    if (categoriaId === 2 || categoriaId === 3) {
      this.cargarSubcategorias(categoriaId);
    }
  }

  // Mostrar todos los números de página
  get numerosPaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }



  private cargarSubcategorias(idCategoriaPadre: number): void {
    this.categoriaService.getSubcategoriasPorCategoria(idCategoriaPadre).subscribe({
      next: (subcategorias: Categoria_producto[]) => {
        this.subcategorias = subcategorias.filter(sub => sub.id_padre === idCategoriaPadre);
        this.mostrarSubcategorias = this.subcategorias.length > 0;
      },
      error: () => {
        this.mostrarSubcategorias = false;
      }
    });
  }

  private calcularTotalPaginas(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.productos.length / this.tamanioPagina));
  }

  get productosPaginados(): ProductoDetalles[] {
    let filtrados = this.aplicarFiltros();
    const totalFiltrados = filtrados.length;
    const nuevasPaginas = Math.max(1, Math.ceil(totalFiltrados / this.tamanioPagina));
    
    // Solo actualizar si cambió el total de páginas
    if (this.totalPaginas !== nuevasPaginas) {
      this.totalPaginas = nuevasPaginas;
      // Solo resetear página si la actual es mayor que el total
      if (this.paginaActual > this.totalPaginas) {
        this.paginaActual = 1;
      }
    }
    
    return this.paginar(filtrados);
  }


  // Filtros 
  private aplicarFiltros(): ProductoDetalles[] {
    return this.productos
      .filter(p => this.filtrarPorBusqueda(p))
      .filter(p => this.filtrarPorCategoria(p))
      .filter(p => this.filtrarPorSubcategoria(p))
      .filter(p => this.filtrarPorTemporada(p));
  }

  private filtrarPorBusqueda(producto: ProductoDetalles): boolean {
    if (!this.filtroBusqueda.trim()) return true;
    return producto.nombre?.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
  }

  private filtrarPorCategoria(producto: ProductoDetalles): boolean {
    if (!this.filtroCategoria) return true;
    
    // Si hay una subcategoría seleccionada, no filtrar por categoría padre aquí
    // (el filtro de subcategoría se encargará)
    if (this.filtroSubcategoria) return true;
    
    const categoriaId = Number(this.filtroCategoria);
    
    // Si es categoría 2 o 3 (con subcategorías), mostrar productos de la categoría padre
    // y de todas sus subcategorías
    if (categoriaId === 2 || categoriaId === 3) {
      // Verificar si el producto pertenece a la categoría padre o a alguna subcategoría
      return producto.categoria_id === categoriaId || 
             this.subcategorias.some(sub => sub.id === producto.categoria_id);
    }
    
    // Para otras categorías, filtrar normalmente
    return producto.categoria_id === categoriaId;
  }

  private filtrarPorSubcategoria(producto: ProductoDetalles): boolean {
    if (!this.filtroSubcategoria) return true;
    // Filtrar por el ID de la subcategoría seleccionada
    return producto.categoria_id === Number(this.filtroSubcategoria);
  }

  private filtrarPorTemporada(producto: ProductoDetalles): boolean {
    if (!this.filtroTemporada) return true;
    const idSeleccionado = Number(this.filtroTemporada);
    // Intentar comparar primero por id (más robusto) y luego por nombre si ya está seteado
    if (producto.temporada_id === idSeleccionado) return true;
    const temporadaSeleccionada = this.temporadas.find(t => t.id === idSeleccionado);
    return temporadaSeleccionada ? producto.nombre_temporada === temporadaSeleccionada.nombre : true;
  }


  private paginar(productos: ProductoDetalles[]): ProductoDetalles[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    return productos.slice(inicio, inicio + this.tamanioPagina);
  }

  // Normaliza productos para completar nombre_categoria y nombre_temporada si vienen undefined
  private normalizeProductos(): void {
    if (!this.productos || this.productos.length === 0) return;
    for (const p of this.productos) {
      // Categoria
      if (!p.nombre_categoria) {
        const raw: any = p as any;
        p.nombre_categoria = raw.categoria?.nombre || raw.categoria_nombre || raw.nombreCategoria || '';
      }
      // Temporada
      if (!p.nombre_temporada) {
        const raw: any = p as any;
        p.nombre_temporada = raw.temporada?.nombre || raw.temporada_nombre || raw.nombreTemporada || '';
      }
      // Si aún no hay nombre_temporada pero existe temporada_id y ya cargamos temporadas, buscarlo
      if (!p.nombre_temporada && p.temporada_id && this.temporadas?.length) {
        const temp = this.temporadas.find(t => t.id === p.temporada_id);
        if (temp) p.nombre_temporada = temp.nombre;
      }
    }
  }

  // Eliminado getBadgeClass y coloresTemporadas: ya no se utilizan en la vista.
  // Clase para badge de temporada según id
  getBadgeClass(p: ProductoDetalles): string {
    return this.coloresTemporadas[p.temporada_id] || 'bg-gray-100 text-gray-700';
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

  toggleProducto(id: number): void {
    if (this.productosExpandidos.has(id)) {
      this.productosExpandidos.delete(id);
    } else {
      this.productosExpandidos.add(id);
    }
  }

  isProductoExpandido(id: number): boolean {
    return this.productosExpandidos.has(id);
  }

  get Math(): Math {
    return Math;
  }

  get totalFiltrados(): number {
    return this.aplicarFiltros().length;
  }

  get rangoInicio(): number {
    if (this.totalFiltrados === 0) return 0;
    return (this.paginaActual - 1) * this.tamanioPagina + 1;
  }

  get rangoFin(): number {
    if (this.totalFiltrados === 0) return 0;
    return Math.min(this.paginaActual * this.tamanioPagina, this.totalFiltrados);
  }

  verDetallesProducto(id: number): void {
    if (!id) return;
    this.router.navigate(['/admin/images', id]);
  }

  ngOnDestroy(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}