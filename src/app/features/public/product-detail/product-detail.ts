import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../core/service/producto.service';
import { Producto } from '../../../core/models/producto.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  template: `
  <div *ngIf="loading">Loading product...</div>
  <div *ngIf="!loading && errorMessage">{{ errorMessage }}</div>

  <div *ngIf="!loading && product">
    <h2 class="text-2xl font-bold">{{ product.nombre }}</h2>
    <img [src]="product.imagen_url" alt="{{ product.nombre }}" class="w-full h-80 object-cover my-4">
    <p>{{ product.descripcion }}</p>
    <p>Category ID: {{ product.categoria_id }}</p>
    <p>Season ID: {{ product.temporada_id }}</p>
  </div>

  `,
})
export class ProductDetail implements OnInit{
  product!: Producto;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.productoService.getDetallesById(id).subscribe({
      next: res => {
        this.product = res;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error loading product details.';
      }
    });
  }
}
