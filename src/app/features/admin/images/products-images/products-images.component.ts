import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ProductoService } from '../../../../core/service/producto.service';
import { ProductoDetalles } from '../../../../core/models/producto_detalles.model';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-products-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-images.component.html'
})
export class ProductsImagesComponent implements OnInit, AfterViewInit, OnDestroy {
  productos: ProductoDetalles[] = [];
  currentIndex = 0;
  itemsPerView = 3;
  isLoading = true;
  
  private readonly destroy$ = new Subject<void>();
  private ro?: ResizeObserver;

  readonly cardWidth = 372;
  readonly gap = 24;

  @ViewChild('viewportRef', { static: false }) viewportRef?: ElementRef<HTMLDivElement>;

  constructor(private productoService: ProductoService) {}

  @HostListener('window:resize')
  onResize(): void {
    this.calculateItemsPerViewByWindow();
    this.adjustItemsPerViewByContainer();
  }

  ngOnInit(): void {
    this.calculateItemsPerViewByWindow();
    this.loadProductos();
  }

  ngAfterViewInit(): void {
    this.adjustItemsPerViewByContainer();
    if ('ResizeObserver' in window && this.viewportRef?.nativeElement) {
      this.ro = new ResizeObserver(() => this.adjustItemsPerViewByContainer());
      this.ro.observe(this.viewportRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateItemsPerViewByWindow(): void {
    const width = window.innerWidth;
    if (width >= 1280) {
      this.itemsPerView = 3;
    } else if (width >= 1024) {
      this.itemsPerView = 2;
    } else {
      this.itemsPerView = 1;
    }
    this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
  }

  private adjustItemsPerViewByContainer(): void {
    const el = this.viewportRef?.nativeElement;
    if (!el) return;
    
    const available = el.clientWidth;
    const fit = Math.max(1, Math.min(3, Math.floor((available + this.gap) / (this.cardWidth + this.gap))));
    
    if (fit !== this.itemsPerView) {
      this.itemsPerView = fit;
      this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
    }
  }

  private loadProductos(): void {
    this.isLoading = true;
    this.productoService.getAllDetallesCompletos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.productos = data.filter(p => p.esta_activo);
          this.normalizeProductos();
          this.isLoading = false;
          this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          this.isLoading = false;
        }
      });
  }

  private normalizeProductos(): void {
    if (!this.productos || this.productos.length === 0) return;
    for (const p of this.productos) {
      if (!p.nombre_categoria) {
        const raw: any = p as any;
        p.nombre_categoria = raw.categoria?.nombre || raw.categoria_nombre || raw.nombreCategoria || '';
      }
    }
  }

  getImagenPrincipal(producto: ProductoDetalles): string {
    const imagenPrincipal = producto.imagenes?.find(img => img.es_principal);
    return imagenPrincipal?.url || producto.imagenes?.[0]?.url || 'assets/placeholder-image.jpg';
  }

  get viewportWidth(): number {
    return this.itemsPerView * this.cardWidth + (this.itemsPerView - 1) * this.gap;
  }

  get maxIndex(): number {
    return Math.max(0, this.productos.length - this.itemsPerView);
  }

  get totalSlides(): number {
    return Math.ceil(this.productos.length / this.itemsPerView);
  }

  get slides(): number[] {
    return Array(this.totalSlides).fill(0).map((_, i) => i);
  }

  get currentSlide(): number {
    return Math.floor(this.currentIndex / this.itemsPerView);
  }

  get visibleProductos(): ProductoDetalles[] {
    return this.productos.slice(this.currentIndex, this.currentIndex + this.itemsPerView);
  }

  nextSlide(): void {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  goToSlide(index: number): void {
    this.currentIndex = Math.min(index * this.itemsPerView, this.maxIndex);
  }
}
