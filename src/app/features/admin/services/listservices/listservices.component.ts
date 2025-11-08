import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Categoria_servicio } from '../../../../core/models/categoria_servicio.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';
import { CategoriaServicioService } from '../../../../core/service/categoria_servicio.service';

@Component({
  selector: 'app-listservices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listservices.component.html',
  styleUrls: ['./listservices.component.css']
})
export class ListservicesComponent implements OnInit, OnDestroy {
  // Datos base (sin lógica aún). Luego se reemplaza por datos reales desde el service
  servicios: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    informacion_extra: string;
    imagenes?: Array<{ id?: number; url: string }>;
    categoria?: { id: number; nombre: string };
  }> = [];

  categorias: Categoria_servicio[] = [];
  paginaActual = 1;
  tamanioPagina = 5;
  totalPaginas = 1;

  filtroBusqueda = '';
  filtroCategoria = '';

  // Modales y mensajes (stub por ahora)
  ModalBorrar = false;
  servicioABorrar: any | null = null;
  mostrarModalMensaje = false;
  mensaje = '';
  esError = false;
  private closeTimer: any;

  constructor(
    private http: HttpClient,
    private categoriaServicio: CategoriaServicioService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarServiciosDetalles();
    this.calcularTotalPaginas();
  }

  ngOnDestroy(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  private calcularTotalPaginas(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.servicios.length / this.tamanioPagina));
  }

  private cargarCategorias(): void {
    this.categoriaServicio.getAll().subscribe({
      next: (categorias) => {
        this.categorias = (categorias || []).filter(c => c.id_padre === 0 || (c.tipo?.toLowerCase?.() === 'principal'));
      },
      error: (err) => {
        console.error('Error al cargar categorías de servicios:', err);
        this.categorias = [];
      }
    });
  }

  private cargarServiciosDetalles(): void {
    const url = `${environment.API_URL}/servicios/completos`;
    this.http.get<any>(url).subscribe({
      next: (resp) => {
        const data = Array.isArray(resp) ? resp : (resp?.data || []);
        this.servicios = data.map((s: any) => ({
          id: s.id,
          nombre: s.nombre,
          descripcion: s.descripcion,
          informacion_extra: s.informacion_extra,
          imagenes: s.imagenes || [],
          categoria: { id: s.categoria_id, nombre: s.nombre_categoria }
        }));
        this.calcularTotalPaginas();
      },
      error: (err) => {
        console.error('Error al cargar servicios completos:', err);
        this.servicios = [];
        this.calcularTotalPaginas();
      }
    });
  }

  // Getter para paginado (aplica filtros básicos en memoria)
  get serviciosPaginados() {
    const filtrados = this.aplicarFiltros();
    this.actualizarPaginacion(filtrados.length);
    return this.paginar(filtrados);
  }

  // Filtros (diseño: lógica mínima por ahora)
  private aplicarFiltros() {
    return this.servicios
      .filter(s => this.filtrarPorBusqueda(s))
      .filter(s => this.filtrarPorCategoria(s));
  }

  private filtrarPorBusqueda(servicio: any): boolean {
    if (!this.filtroBusqueda.trim()) return true;
    return (servicio.nombre || '').toLowerCase().includes(this.filtroBusqueda.toLowerCase());
  }

  private filtrarPorCategoria(servicio: any): boolean {
    if (!this.filtroCategoria) return true;
    return String(servicio?.categoria?.id || '') === String(this.filtroCategoria);
  }

  private actualizarPaginacion(totalItems: number) {
    this.totalPaginas = Math.max(1, Math.ceil(totalItems / this.tamanioPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
  }

  private paginar(items: any[]) {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    return items.slice(inicio, inicio + this.tamanioPagina);
  }

  // Paginación UI
  get numerosPaginas() {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }
  esPaginaActual(n: number) { return this.paginaActual === n; }
  get esPrimeraPagina() { return this.paginaActual === 1; }
  get esUltimaPagina() { return this.paginaActual === this.totalPaginas; }
  irAPagina(n: number) { this.paginaActual = n; }
  anteriorPagina() { if (!this.esPrimeraPagina) this.paginaActual--; }
  siguientePagina() { if (!this.esUltimaPagina) this.paginaActual++; }


  // Acciones (stubs por ahora)
  borrarServicio(id: number) {
    this.servicioABorrar = this.servicios.find(s => s.id === id) || null;
    this.ModalBorrar = true;
  }
  cancelarBorrado() { this.ModalBorrar = false; this.servicioABorrar = null; }
  confirmarBorrado() {
    // Diseño: cerrar modal y mostrar mensaje
    this.ModalBorrar = false;
    this.mensaje = 'Servicio borrado (demo)';
    this.esError = false;
    this.mostrarModalMensaje = true;
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.cerrarModal(), 2500);
  }
  cerrarModal() { this.mostrarModalMensaje = false; this.mensaje = ''; }
}
