import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../core/service/producto.service';
import { Producto } from '../../../core/models/producto.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit{
  allProducts: Producto[] = []; 
  products: Producto[] = [];  
  loading: boolean = true;
  errorMessage: string = '';
  categoryId: number = 0;

  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = +params['categoryId'];
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading = true;
    this.productoService.getAll().subscribe({
      next: res => {
        this.allProducts = res;
        this.products = this.allProducts.filter(p => p.categoria_id === this.categoryId);
        this.loading = false;
        if (this.products.length === 0) {
          this.errorMessage = 'No products found for this category.';
        } else {
          this.errorMessage = '';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error loading products.';
      }
    });
  }

  goToProduct(productId: number) {
    this.router.navigate(['/producto', productId]);
  }
}
