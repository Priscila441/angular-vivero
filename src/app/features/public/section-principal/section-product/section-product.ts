import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../../core/service/producto.service';
import { Producto } from '../../../../core/models/producto.model';

@Component({
  selector: 'app-section-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-product.html'
})
export class SectionProduct {
  categorias : Categoria_producto[] = [];
  errorMessage: string = '';
  loading: boolean = true;
  productos : Producto[] = [];
  
  constructor(private categoriaService : CategoriaProductoService, private router: Router, private productoService : ProductoService) {}

  ngOnInit():void {
    this.loadCategorias();
    this.loadProducts();
  }

  loadCategorias() {
    this.loading = true;
    this.categoriaService.getAll().subscribe({
      next: res => {
        this.categorias = res;
        this.loading = false;
        if (this.categorias.length === 0) {
          this.errorMessage = 'No se han encontrado categorías de productos.';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error al cargar las categorías. Intente más tarde.';
      }
    });
  }

  loadProducts(){
    this.loading = true;
    this.productoService.getAll().subscribe({
      next: res => {
        this.productos = res;
        this.loading = false;
        if (this.productos.length === 0){
          this.errorMessage = 'No se han encontrado productos.';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error al cargar los productos. Intente más tarde.';
      }

    })
  }

  goToCategory(categoryId: number) {
    const productsInCategory = this.productos.filter(p => p.categoria_id === categoryId);
    if (productsInCategory.length === 1){
      this.router.navigate(['/producto', productsInCategory[0].id]);
    }
    else{
      this.router.navigate(['/productos', categoryId]);
    }
  }
}
