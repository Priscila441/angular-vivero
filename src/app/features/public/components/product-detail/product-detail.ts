import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../../core/service/producto.service';
import { ProductoDetalles } from '../../../../core/models/producto_detalles.model';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.html',
  standalone: true,
  imports: [CommonModule],
})
export class ProductDetail implements OnInit, OnDestroy {
  product!: ProductoDetalles;
  loading = true;
  errorMessage = '';
  hoverImage = false;

  showModal = false;
  modalProductName = '';

  relatedProducts: ProductoDetalles[] = [];
  hoverSecondImageMap: Record<number, string> = {};

  private subs: Subscription[] = [];

  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const sub = this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProduct(productId);
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // 🔹 Cargar producto principal
  loadProduct(id: number) {
    this.loading = true;
    this.errorMessage = '';

    const sub = this.productoService.getDetallesById(id).pipe(
      catchError(err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error al cargar el producto.';
        console.error('Error getDetallesById', err);
        return of(null);
      })
    ).subscribe(res => {
      this.loading = false;

      if (!res) return;

      // Revisamos success
      if ((res as any).success === false) {
        this.errorMessage = (res as any).message || 'No se pudo obtener el producto.';
        return;
      }

      // Producto válido
      const data = (res as any).data || {};
      this.product = data;

      // Hover principal
      this.prepareHoverMapForProduct(this.product);

      // Productos relacionados
      this.loadRelated(this.product);
    });

    this.subs.push(sub);
  }

  // 🔹 Cargar productos relacionados
  loadRelated(currentProduct: ProductoDetalles) {
    const sub = this.productoService.getAllDetalles().pipe(
      catchError(err => {
        console.warn('No se pudieron cargar productos relacionados', err);
        return of([]);
      })
    ).subscribe(res => {
      let productos: ProductoDetalles[] = [];

      if (Array.isArray(res)) {
        productos = res;
      } else if ((res as any).success) {
        productos = (res as any).data || [];
      }

      this.relatedProducts = productos
        .filter(p => p.id !== currentProduct.id && p.nombre_categoria === currentProduct.nombre_categoria)
        .slice(0, 10);

      if (this.relatedProducts.length < 4) {
        const extra = productos.filter(
          p => p.id !== currentProduct.id && !this.relatedProducts.some(r => r.id === p.id)
        );
        this.relatedProducts = [...this.relatedProducts, ...extra].slice(0, 8);
      }

      this.relatedProducts.forEach(rp => this.prepareHoverMapForProduct(rp));
    });

    this.subs.push(sub);
  }

  // 🔹 Helpers de imágenes
  getPrimaryImage(): string {
    if (!this.product?.imagenes?.length) return '';
    const primary = this.product.imagenes.find(i => i.es_principal) ?? this.product.imagenes[0];
    return primary.url;
  }

  getSecondaryImage(): string | null {
    if (!this.product?.imagenes || this.product.imagenes.length < 2) return null;
    const main = this.product.imagenes.find(i => i.es_principal) ?? this.product.imagenes[0];
    const sec = this.product.imagenes.find(i => i.id !== main?.id);
    return sec ? sec.url : null;
  }

  prepareHoverMapForProduct(p: ProductoDetalles) {
    if (!p?.imagenes) return;
    const main = p.imagenes.find(i => i.es_principal) ?? p.imagenes[0];
    const second = p.imagenes.find(i => i.id !== main?.id);
    if (second) this.hoverSecondImageMap[p.id] = second.url;
  }

  productImageByObject(p: ProductoDetalles): string | null {
    if (!p?.imagenes?.length) return null;
    const main = p.imagenes.find(i => i.es_principal) ?? p.imagenes[0];
    return main.url;
  }

  // 🔹 Navegación entre productos
  goToProduct(id: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadProduct(id);
  }

  // 🔹 Modal
  onAgregarConsulta() {
    this.modalProductName = this.product?.nombre || '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // 🔹 Parseo de detalles extra
  parseExtra(info: string | object): any {
    try {
      return typeof info === 'string' ? JSON.parse(info) : info;
    } catch {
      return {};
    }
  }
}
