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

  // Modal para agregar categoría de producto
  isModalProductoOpen = false;
  nuevaCategoriaProducto = {
    nombre: '',
    id_padre: 0,
    tipo: 'principal',
    imagen_url: '',
    imagen2_url: ''
  };

  // Modal para agregar categoría de servicio
  isModalServicioOpen = false;
  nuevaCategoriaServicio = {
    nombre: '',
    id_padre: 0,
    tipo: 'principal',
    imagen_url: '',
    imagen2_url: ''
  };

  // Modal para agregar subcategoría de producto
  isModalSubcategoriaOpen = false;
  nuevaSubcategoria = {
    nombre: '',
    id_padre: 0,
    imagen_url: '',
    imagen2_url: ''
  };

  // Mensajes y modales de éxito
  showSuccessModal = false;
  successMessage = '';

  // Modal de borrado
  modalBorrar = false;
  categoriaABorrar: any = null;
  tipoBorrado: 'producto' | 'servicio' | 'subcategoria' = 'producto';
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
        console.error('Error al cargar categorías de productos:', error);
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
        console.error('Error al cargar subcategorías:', error);
      }
    });
  }

  loadCategoriasServicio(): void {
    this.http.get<any>('http://localhost:4001/api/categorias-servicios').subscribe({
      next: (response) => {
        console.log('Respuesta de categorías de servicios:', response);
        this.categoriasServicio = response?.data || [];
        console.log('Categorías de servicios cargadas:', this.categoriasServicio.length);
        this.totalPaginasServicio = Math.ceil(this.categoriasServicio.length / this.itemsPorPaginaServicio);
        // Ajustar página si es necesario después de eliminar
        if (this.categoriasServicio.length > 0 && this.paginaActualServicio > this.totalPaginasServicio) {
          this.paginaActualServicio = this.totalPaginasServicio;
        } else if (this.categoriasServicio.length === 0) {
          this.paginaActualServicio = 1;
        }
        console.log('Total páginas servicio:', this.totalPaginasServicio, 'Página actual:', this.paginaActualServicio);
      },
      error: (error) => {
        console.error('Error al cargar categorías de servicios:', error);
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

  get categoriasPrincipales(): Categoria_producto[] {
    return this.categoriasProducto.filter(cat => 
      cat.tipo === 'principal' || cat.id_padre === 0
    );
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

  // Métodos para el modal de categoría de producto
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
        console.log('Categoría creada exitosamente:', response);
        this.loadCategoriasProducto();
        this.closeModalProducto();
        this.mostrarModalExito(`La categoría "${categoriaData.nombre}" ha sido agregada exitosamente.`);
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
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

  // Métodos para borrar categoría
  borrarCategoriaProducto(categoria: any): void {
    this.categoriaABorrar = categoria;
    this.tipoBorrado = 'producto';
    this.modalBorrar = true;
  }

  borrarCategoriaServicio(categoria: any): void {
    this.categoriaABorrar = categoria;
    this.tipoBorrado = 'servicio';
    this.modalBorrar = true;
  }

  borrarSubcategoriaProducto(subcategoria: any): void {
    this.categoriaABorrar = subcategoria;
    this.tipoBorrado = 'subcategoria';
    this.modalBorrar = true;
  }

  cancelarBorrado(): void {
    this.modalBorrar = false;
    this.categoriaABorrar = null;
    this.tipoBorrado = 'producto';
  }

  confirmarBorrado(): void {
    if (!this.categoriaABorrar) return;

    const nombreCategoria = this.categoriaABorrar.nombre;
    const idCategoria = this.categoriaABorrar.id;
    
    console.log('Categoría a borrar:', this.categoriaABorrar);
    console.log('ID a usar para eliminar:', idCategoria);

    if (this.tipoBorrado === 'producto') {
      this.http.delete(`http://localhost:4001/api/categorias/${idCategoria}`).subscribe({
        next: () => {
          this.loadCategoriasProducto();
          this.modalBorrar = false;
          this.categoriaABorrar = null;
          this.mostrarMensajeTemporada(`La categoría "${nombreCategoria}" ha sido eliminada exitosamente.`);
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
          this.modalBorrar = false;
          this.categoriaABorrar = null;
        }
      });
    } else if (this.tipoBorrado === 'subcategoria') {
      this.http.delete(`http://localhost:4001/api/categorias/${idCategoria}`).subscribe({
        next: () => {
          this.loadSubcategoriasProducto();
          this.modalBorrar = false;
          this.categoriaABorrar = null;
          this.mostrarMensajeTemporada(`La subcategoría "${nombreCategoria}" ha sido eliminada exitosamente.`);
        },
        error: (error) => {
          console.error('Error al eliminar subcategoría:', error);
          this.modalBorrar = false;
          this.categoriaABorrar = null;
        }
      });
    } else if (this.tipoBorrado === 'servicio') {
      console.log('=== INICIO ELIMINACIÓN CATEGORÍA SERVICIO ===');
      console.log('Categoría completa:', JSON.stringify(this.categoriaABorrar, null, 2));
      console.log('ID a usar:', idCategoria);
      console.log('URL imágenes:', `http://localhost:4001/api/imagenes-servicio/${idCategoria}`);
      console.log('URL servicio:', `http://localhost:4001/api/servicios/${idCategoria}`);
      
      // Primero eliminar las imágenes
      this.http.delete(`http://localhost:4001/api/imagenes-servicio/${idCategoria}`).subscribe({
        next: () => {
          console.log('✅ Imágenes eliminadas exitosamente');
          // Luego eliminar el servicio (categoría)
          this.http.delete(`http://localhost:4001/api/servicios/${idCategoria}`).subscribe({
            next: () => {
              console.log('Categoría de servicio eliminada exitosamente');
              // Recargar las categorías (la paginación se ajusta dentro de loadCategoriasServicio)
              this.loadCategoriasServicio();
              this.modalBorrar = false;
              this.categoriaABorrar = null;
              this.mostrarMensajeTemporada(`La categoría de servicio "${nombreCategoria}" ha sido eliminada exitosamente.`);
            },
            error: (error) => {
              console.error('Error al eliminar categoría de servicio:', error);
              this.modalBorrar = false;
              this.categoriaABorrar = null;
            }
          });
        },
        error: (error) => {
          console.error('Error al eliminar imágenes de servicio:', error);
          // Intentar eliminar el servicio de todas formas
          this.http.delete(`http://localhost:4001/api/servicios/${idCategoria}`).subscribe({
            next: () => {
              console.log('Categoría de servicio eliminada exitosamente (sin imágenes)');
              // Recargar las categorías (la paginación se ajusta dentro de loadCategoriasServicio)
              this.loadCategoriasServicio();
              this.modalBorrar = false;
              this.categoriaABorrar = null;
              this.mostrarMensajeTemporada(`La categoría de servicio "${nombreCategoria}" ha sido eliminada exitosamente.`);
            },
            error: (error2) => {
              console.error('Error al eliminar categoría de servicio:', error2);
              this.modalBorrar = false;
              this.categoriaABorrar = null;
            }
          });
        }
      });
    }
  }

  private mostrarMensajeTemporada(mensaje: string): void {
    this.mensaje = mensaje;
    this.mostrarMensajeExito = true;

    setTimeout(() => {
      this.mostrarMensajeExito = false;
      this.mensaje = '';
    }, 3000);
  }

  // Métodos para el modal de categoría de servicio
  openModalServicio(): void {
    this.isModalServicioOpen = true;
  }

  closeModalServicio(): void {
    this.isModalServicioOpen = false;
    this.nuevaCategoriaServicio = {
      nombre: '',
      id_padre: 0,
      tipo: 'principal',
      imagen_url: '',
      imagen2_url: ''
    };
  }

  guardarCategoriaServicio(): void {
    if (!this.nuevaCategoriaServicio.nombre) {
      console.error('El nombre es requerido');
      return;
    }

    const categoriaData: Categoria_servicio = {
      id: 0,
      nombre: this.nuevaCategoriaServicio.nombre,
      id_padre: this.nuevaCategoriaServicio.id_padre || 0,
      tipo: this.nuevaCategoriaServicio.tipo || 'principal',
      imagen_url: this.nuevaCategoriaServicio.imagen_url || '',
      imagen2_url: this.nuevaCategoriaServicio.imagen2_url || ''
    };

    this.categoriaServicioService.create(categoriaData).subscribe({
      next: (response) => {
        console.log('Categoría de servicio creada exitosamente:', response);
        this.loadCategoriasServicio();
        this.closeModalServicio();
        this.mostrarModalExito(`La categoría de servicio "${categoriaData.nombre}" ha sido agregada exitosamente.`);
      },
      error: (error) => {
        console.error('Error al crear categoría de servicio:', error);
      }
    });
  }

  // Métodos para el modal de subcategoría de producto
  openModalSubcategoria(): void {
    this.isModalSubcategoriaOpen = true;
  }

  closeModalSubcategoria(): void {
    this.isModalSubcategoriaOpen = false;
    this.nuevaSubcategoria = {
      nombre: '',
      id_padre: 0,
      imagen_url: '',
      imagen2_url: ''
    };
  }

  guardarSubcategoria(): void {
    if (!this.nuevaSubcategoria.nombre) {
      console.error('El nombre es requerido');
      return;
    }

    if (!this.nuevaSubcategoria.id_padre || this.nuevaSubcategoria.id_padre === 0) {
      console.error('Debe seleccionar una categoría padre');
      return;
    }

    const subcategoriaData = {
      nombre: this.nuevaSubcategoria.nombre,
      id_padre: Number(this.nuevaSubcategoria.id_padre) || 0,
      tipo: 'secundaria',
      imagen_url: this.nuevaSubcategoria.imagen_url || '',
      imagen2_url: this.nuevaSubcategoria.imagen2_url || ''
    };

    this.http.post<any>('http://localhost:4001/api/categorias', subcategoriaData).subscribe({
      next: (response) => {
        console.log('Subcategoría creada exitosamente:', response);
        this.loadSubcategoriasProducto();
        this.closeModalSubcategoria();
        this.mostrarModalExito(`La subcategoría "${subcategoriaData.nombre}" ha sido agregada exitosamente.`);
      },
      error: (error) => {
        console.error('Error al crear subcategoría:', error);
      }
    });
  }
}
