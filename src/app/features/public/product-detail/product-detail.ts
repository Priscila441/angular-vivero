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
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      
      <!-- Loading -->
      <div *ngIf="loading" class="text-green-700 text-lg font-medium animate-pulse">
        Cargando producto...
      </div>

      <!-- Error -->
      <div *ngIf="!loading && errorMessage" class="bg-red-100 text-red-700 p-4 rounded-lg shadow">
        {{ errorMessage }}
      </div>

      <!-- Product Card -->
      <div *ngIf="!loading && product" 
           class="bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl w-full">
        

           <img src="mandarinas.jpg" 
           alt="imagen del producto"
           class="w-full h-64 object-cover transition-transform duration-500 hover:scale-110" />
        <!-- Imagen principal 
        <img [src]="product.imagen_url" 
             alt="{{ product.nombre }}" 
             class="w-full h-80 object-cover">-->

        <!-- Contenido -->
        <div class="p-6">
          <h2 class="text-3xl font-bold text-green-800 mb-4">
            {{ product.nombre }}
          </h2>
          
          <p class="text-gray-600 mb-6 leading-relaxed">
            {{ product.descripcion }}
          </p>

          <div class="flex items-center justify-between text-gray-700 text-sm">
            <p class="bg-green-50 px-4 py-2 rounded-lg shadow-sm">
              <span class="font-semibold text-green-700">Categoría:</span> {{ product.categoria_id }}
            </p>
            <p class="bg-emerald-50 px-4 py-2 rounded-lg shadow-sm">
              <span class="font-semibold text-emerald-700">Temporada:</span> {{ product.temporada_id }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductDetail implements OnInit {
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
