import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CategoriaProductoService } from '../../../core/service/categoria_producto.service';
import { CategoriaServicioService } from '../../../core/service/categoria_servicio.service';
import { Categoria_producto } from '../../../core/models/categoria_producto.models';
import { Categoria_servicio } from '../../../core/models/categoria_servicio.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
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
      }
    });
  }

  loadSubcategoriasProducto(): void {
    this.http.get<any>('http://localhost:4001/api/categorias/subcategorias').subscribe({
      next: (response) => {
        this.subcategoriasProducto = response?.data || [];
        this.totalPaginasSubProducto = Math.ceil(this.subcategoriasProducto.length / this.itemsPorPaginaSubProducto);
      }
    });
  }

  loadCategoriasServicio(): void {
    this.http.get<any>('http://localhost:4001/api/categorias-servicios').subscribe({
      next: (response) => {
        this.categoriasServicio = response?.data || [];
        this.totalPaginasServicio = Math.ceil(this.categoriasServicio.length / this.itemsPorPaginaServicio);
      }
    });
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
}
