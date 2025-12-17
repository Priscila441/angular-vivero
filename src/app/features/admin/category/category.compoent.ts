import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CategoriaProductoService } from '../../../core/service/categoria_producto.service';
import { CategoriaServicioService } from '../../../core/service/categoria_servicio.service';
import { Categoria_producto } from '../../../core/models/categoria_producto.models';
import { Categoria_servicio } from '../../../core/models/categoria_servicio.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category.html',
  styleUrls: []
})
export class CategoryComponent implements OnInit {
  categoriasProducto: Categoria_producto[] = [];
  subcategoriasProducto: Categoria_producto[] = [];
  categoriasServicio: Categoria_servicio[] = [];
  
  paginaActualProducto = 1;
  itemsPorPaginaProducto = 5;
  totalPaginasProducto = 1;
  
  paginaActualSubProducto = 1;
  itemsPorPaginaSubProducto = 5;
  totalPaginasSubProducto = 1;
  
  paginaActualServicio = 1;
  itemsPorPaginaServicio = 5;
  totalPaginasServicio = 1;

  // Modal para agregar categorÃ­a de producto
  isModalProductoOpen = false;
  nuevaCategoriaProducto = {
    nombre: '',
    id_padre: 0,
    tipo: 'principal',
    imagen_url: '',
    imagen2_url: ''
  };

  // Mensajes y modales de Ã©xito
  showSuccessModal = false;
  successMessage = '';

  // Modal de borrado
  modalBorrar = false;
  categoriaABorrar: any = null;
  mostrarMensajeExito = false;
  mensaje = '';

  constructor(
    private http: HttpClient,
    private categoriaProductoService: CategoriaProductoService,
    private categoriaServicioService: CategoriaServicioService
  ) {}

  ngOnInit(): void {
    this.loadCategoriasProducto();
    this.loadSubcategoriasProducto();
    this.loadCategoriasServicio();
  }

  loadCategoriasProducto(): void {
    this.http.get<any>('http://localhost:4001/api/categorias').subscribe({
      next: (response) => {
        this.categoriasProducto = response?.data || [];
        this.totalPaginasProducto = Math.ceil(this.categoriasProducto.length / this.itemsPorPaginaProducto);
      },
      error: (error) => {
        console.error('Error al cargar categorÃ­as de productos:', error);
      }
    });
  }

  loadSubcategoriasProducto(): void {
    this.http.get<any>('http://localhost:4001/api/categorias/subcategorias').subscribe({
      next: (response) => {
        this.subcategoriasProducto = response?.data || [];
        this.totalPaginasSubProducto = Math.ceil(this.subcategoriasProducto.length / this.itemsPorPaginaSubProducto);
      },
      error: (error) => {
        console.error('Error al cargar subcategorÃ­as:', error);
      }
    });
  }

  loadCategoriasServicio(): void {
    this.http.get<any>('http://localhost:4001/api/categorias-servicios').subscribe({
      next: (response) => {
        this.categoriasServicio = response?.data || [];
        this.totalPaginasServicio = Math.ceil(this.categoriasServicio.length / this.itemsPorPaginaServicio);
      },
      error: (error) => {
        console.error('Error al cargar categorÃ­as de servicios:', error);
      }
    });
  }

  get categoriasProductoPaginadas(): Categoria_producto[] {
    const inicio = (this.paginaActualProducto - 1) * this.itemsPorPaginaProducto;
    const fin = inicio + this.itemsPorPaginaProducto;
    return this.categoriasProducto.slice(inicio, fin);
  }

  get subcategoriasProductoPaginadas(): Categoria_producto[] {
    const inicio = (this.paginaActualSubProducto - 1) * this.itemsPorPaginaSubProducto;
    const fin = inicio + this.itemsPorPaginaSubProducto;
    return this.subcategoriasProducto.slice(inicio, fin);
  }

  get categoriasServicioPaginadas(): Categoria_servicio[] {
    const inicio = (this.paginaActualServicio - 1) * this.itemsPorPaginaServicio;
    const fin = inicio + this.itemsPorPaginaServicio;
    return this.categoriasServicio.slice(inicio, fin);
  }

  anteriorPaginaProducto(): void {
    if (this.paginaActualProducto > 1) this.paginaActualProducto--;
  }

  siguientePaginaProducto(): void {
    if (this.paginaActualProducto < this.totalPaginasProducto) this.paginaActualProducto++;
  }

  anteriorPaginaSubProducto(): void {
    if (this.paginaActualSubProducto > 1) this.paginaActualSubProducto--;
  }

  siguientePaginaSubProducto(): void {
    if (this.paginaActualSubProducto < this.totalPaginasSubProducto) this.paginaActualSubProducto++;
  }

  anteriorPaginaServicio(): void {
    if (this.paginaActualServicio > 1) this.paginaActualServicio--;
  }

  siguientePaginaServicio(): void {
    if (this.paginaActualServicio < this.totalPaginasServicio) this.paginaActualServicio++;
  }

  // MÃ©todos para el modal de categorÃ­a de producto
  openModalProducto(): void {
    this.isModalProductoOpen = true;
  }

  closeModalProducto(): void {
    this.isModalProductoOpen = false;
    this.nuevaCategoriaProducto = {
      nombre: '',
      id_padre: 0,
      tipo: 'principal',
      imagen_url: '',
      imagen2_url: ''
    };
  }

  guardarCategoriaProducto(): void {
    if (!this.nuevaCategoriaProducto.nombre) {
      console.error('El nombre es requerido');
      return;
    }

    const categoriaData = {
      nombre: this.nuevaCategoriaProducto.nombre,
      id_padre: this.nuevaCategoriaProducto.id_padre || 0,
      tipo: this.nuevaCategoriaProducto.tipo || 'principal',
      imagen_url: this.nuevaCategoriaProducto.imagen_url || '',
      imagen2_url: this.nuevaCategoriaProducto.imagen2_url || ''
    };

    this.http.post<any>('http://localhost:4001/api/categorias', categoriaData).subscribe({
      next: (response) => {
        console.log('CategorÃ­a creada exitosamente:', response);
        this.loadCategoriasProducto();
        this.closeModalProducto();
        this.mostrarModalExito(`La categorÃ­a "${categoriaData.nombre}" ha sido agregada exitosamente.`);
      },
      error: (error) => {
        console.error('Error al crear categorÃ­a:', error);
      }
    });
  }

  private mostrarModalExito(mensaje: string): void {
    this.successMessage = mensaje;
    this.showSuccessModal = true;
    
    setTimeout(() => {
      this.showSuccessModal = false;
      this.successMessage = '';
    }, 3500);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successMessage = '';
  }

  // MÃ©todos para borrar categorÃ­a
  borrarCategoriaProducto(categoria: any): void {
    this.categoriaABorrar = categoria;
    this.modalBorrar = true;
  }

  cancelarBorrado(): void {
    this.modalBorrar = false;
    this.categoriaABorrar = null;
  }

  confirmarBorrado(): void {
    if (!this.categoriaABorrar) return;

    const nombreCategoria = this.categoriaABorrar.nombre;
    const idCategoria = this.categoriaABorrar.id;

    this.http.delete(`http://localhost:4001/api/categorias/${idCategoria}`).subscribe({
      next: () => {
        this.loadCategoriasProducto();
        this.modalBorrar = false;
        this.categoriaABorrar = null;
        this.mostrarMensajeTemporada(`La categorÃ­a "${nombreCategoria}" ha sido eliminada exitosamente.`);
      },
      error: (error) => {
        console.error('Error al eliminar categorÃ­a:', error);
        this.modalBorrar = false;
        this.categoriaABorrar = null;
      }
    });
  }

  private mostrarMensajeTemporada(mensaje: string): void {
    this.mensaje = mensaje;
    this.mostrarMensajeExito = true;

    setTimeout(() => {
      this.mostrarMensajeExito = false;
      this.mensaje = '';
    }, 3000);
  }
}
