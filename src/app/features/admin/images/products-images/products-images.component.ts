import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../../core/service/producto.service';
import { ProductoDetalles, ImagenProducto } from '../../../../core/models/producto_detalles.model';

@Component({
  selector: 'app-product-images',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './products-images.component.html',
  styleUrls: []
})
export class ProductImagesComponent implements OnInit {
  productosCompletos: ProductoDetalles[] = [];

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.productoService.getAllDetallesCompletos().subscribe((data: ProductoDetalles[]) => {
      this.productosCompletos = data || [];
    });
  }

  trackById(_: number, item: ProductoDetalles): number {
    return item.id;
  }

  getPrimaryImage(producto: ProductoDetalles): string {
    if (!producto?.imagenes || producto.imagenes.length === 0) return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
    const principal: ImagenProducto | undefined = producto.imagenes.find(img => img.es_principal) || producto.imagenes[0];
    return principal?.url || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
  }

  onVerDetalles(productoId: number): void {
    // Placeholder: navegación futura al detalle
    console.log('Ver detalles producto:', productoId);
  }
}