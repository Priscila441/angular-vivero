import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../../core/service/producto.service';
import { Producto } from '../../../../core/models/producto.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
})
export class ProductDetail implements OnInit {
  product!: Producto;
  loading: boolean = true;
  errorMessage: string = '';
  showMore: boolean = false; 

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
