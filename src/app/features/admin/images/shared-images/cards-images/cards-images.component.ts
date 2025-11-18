import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../../../core/service/producto.service';
import { ProductoDetalles, ImagenProducto } from '../../../../../core/models/producto_detalles.model';

@Component({
  selector: 'app-cards-images',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cards-images.component.html'
})
export class CardsImagesComponent implements OnInit {
  isLoading = true;
  items: ProductoDetalles[] = [];
  paginas: ProductoDetalles[][] = [];
  visibleItems: ProductoDetalles[] = [];
  currentPage = 0;
  slides: number[] = [];

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.productoService.getAllDetallesCompletos().subscribe({
      next: (data: ProductoDetalles[]) => {
        this.items = data || [];
        this.paginas = this.agruparEnPaginas(this.items, 3);
        this.slides = this.paginas.map((_, i) => i);
        this.currentPage = 0;
        this.actualizarVisible();
        // Debug opcional: inspeccionar estructura para ver categoría si no aparece
        if (this.items.length) {
          // console.log('Ejemplo producto detalles:', this.items[0]);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.items = [];
        this.paginas = [];
        this.visibleItems = [];
      }
    });
  }

  agruparEnPaginas(productos: ProductoDetalles[], tam: number): ProductoDetalles[][] {
    const grupos: ProductoDetalles[][] = [];
    for (let i = 0; i < productos.length; i += tam) {
      grupos.push(productos.slice(i, i + tam));
    }
    return grupos;
  }

  actualizarVisible(): void {
    this.visibleItems = this.paginas[this.currentPage] || [];
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.actualizarVisible();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.paginas.length - 1) {
      this.currentPage++;
      this.actualizarVisible();
    }
  }

  goToPage(index: number): void {
    if (index >= 0 && index < this.paginas.length) {
      this.currentPage = index;
      this.actualizarVisible();
    }
  }

  // Métodos antiguos de slide eliminados (se mantiene paginación por grupos)

  trackById(_: number, item: ProductoDetalles): number {
    return item.id;
  }

  getImagenPrincipal(producto: ProductoDetalles): string {
    const principal: ImagenProducto | undefined = producto.imagenes?.find((img: ImagenProducto) => img.es_principal) || producto.imagenes?.[0];
    return principal?.url || '';
  }

  getCategoriaNombre(producto: any): string {
    // Soporta diferentes posibles estructuras de la API
    return producto?.nombre_categoria || producto?.categoria?.nombre || producto?.categoria_nombre || '';
  }
}