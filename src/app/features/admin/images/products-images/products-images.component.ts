import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductoService } from '../../../../core/service/producto.service';
import { ProductoDetalles } from '../../../../core/models/producto_detalles.model';

@Component({
  selector: 'app-products-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-images.component.html'
})
export class ProductsImagesComponent implements OnInit, AfterViewInit, OnDestroy {
  productos: ProductoDetalles[] = [];
  // Índice del primer item visible (permite mover 1 por 1)
  currentIndex = 0;
  itemsPerView = 3;
  isLoading = true;
  private destroy$ = new Subject<void>();

  // Cards más anchas y menos altas para caber sin scroll
  readonly cardWidth = 340; // px (más anchas)
  readonly gap = 18; // px (gap ajustado)

  @ViewChild('viewportRef', { static: false }) viewportRef?: ElementRef<HTMLDivElement>;
  private ro?: ResizeObserver;

  constructor(private productoService: ProductoService) {}

  @HostListener('window:resize')
  onResize() {
    this.calculateItemsPerViewByWindow();
    this.adjustItemsPerViewByContainer();
  }

  ngOnInit() {
    // Cálculo inicial (fallback por ventana hasta medir contenedor)
    this.calculateItemsPerViewByWindow();
    this.loadProductos();
  }

  ngAfterViewInit(): void {
    // Medir por contenedor real y observar cambios de tamaño
    this.adjustItemsPerViewByContainer();
    if ('ResizeObserver' in window && this.viewportRef?.nativeElement) {
      this.ro = new ResizeObserver(() => this.adjustItemsPerViewByContainer());
      this.ro.observe(this.viewportRef.nativeElement);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateItemsPerViewByWindow() {
    const width = window.innerWidth;
    if (width >= 1280) {
      this.itemsPerView = 3;
    } else if (width >= 1024) {
      this.itemsPerView = 2;
    } else {
      this.itemsPerView = 1;
    }
  // Ajustar índice si nos pasamos tras un resize
  this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
  }

  // Ajuste basado en el ancho real del contenedor (más preciso con sidebar y paddings)
  private adjustItemsPerViewByContainer() {
    const el = this.viewportRef?.nativeElement;
    if (!el) return;
    const available = el.clientWidth; // ancho visible disponible
    const fit = Math.max(1, Math.min(3, Math.floor((available + this.gap) / (this.cardWidth + this.gap))));
    if (fit !== this.itemsPerView) {
      this.itemsPerView = fit;
      this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
    }
  }

  private loadProductos() {
    this.isLoading = true;
    this.productoService.getAllDetallesCompletos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.productos = data.filter(p => p.esta_activo);
          this.isLoading = false;
          // Asegurar índice válido al cargar
          this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          this.isLoading = false;
        }
      });
  }

  getImagenPrincipal(producto: ProductoDetalles): string {
    const imagenPrincipal = producto.imagenes?.find(img => img.es_principal);
    return imagenPrincipal?.url || producto.imagenes?.[0]?.url || 'assets/placeholder-image.jpg';
  }

  // Ancho visible del carrusel (exactamente N cards)
  get viewportWidth(): number {
    return this.itemsPerView * this.cardWidth + (this.itemsPerView - 1) * this.gap;
  }

  // Último índice posible (para no dejar espacios vacíos al final)
  get maxIndex(): number {
    return Math.max(0, this.productos.length - this.itemsPerView);
  }

  // Offset en píxeles del track
  get offsetPx(): number {
    return this.currentIndex * (this.cardWidth + this.gap);
  }

  // Dots por página (grupo de cards visibles)
  get totalSlides(): number {
    return Math.ceil(this.productos.length / this.itemsPerView);
  }

  get slides(): number[] {
    return Array(this.totalSlides).fill(0).map((_, i) => i);
  }

  // Slide actual (para activar dot)
  get currentSlide(): number {
    return Math.floor(this.currentIndex / this.itemsPerView);
  }

  nextSlide() { if (this.currentIndex < this.maxIndex) this.currentIndex++; }

  prevSlide() { if (this.currentIndex > 0) this.currentIndex--; }

  goToSlide(index: number) {
    // Saltar por página completa
    this.currentIndex = Math.min(index * this.itemsPerView, this.maxIndex);
  }

  // Nueva lista recortada para eliminar ancho gigante del track
  get visibleProductos(): ProductoDetalles[] {
    return this.productos.slice(this.currentIndex, this.currentIndex + this.itemsPerView);
  }
}
