import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { CommonModule } from '@angular/common';

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
  
  constructor(private categoriaService : CategoriaProductoService, private router: Router) {}

  ngOnInit():void {
    this.loadCategorias();
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
        // Puedes mostrar un mensaje personalizado o usar el error del backend si viene en err.error.message
        this.errorMessage = err?.error?.message || 'Error al cargar las categorías. Intente más tarde.';
      }
    });
  }

  goToCategory(categoryId: number) {
    this.router.navigate(['/productos', categoryId]);
  }
}
