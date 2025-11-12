import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServicioService } from '../../../../core/service/servicio.service';
import { environment } from '../../../../../environments/environment.development';

// Tipo local para no tocar modelos globales
interface ServicioCompleto {
  id: number;
  nombre: string;
  descripcion: string;
  informacion_extra?: string;
  esta_activo?: boolean;
  categoria_id?: number;
  nombre_categoria?: string;
  imagenes?: Array<{ id?: number; url: string; es_principal?: boolean; orden?: number }>;
}

@Component({
  selector: 'app-services-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services-images.component.html'
})
export class ServicesImagesComponent implements OnInit, AfterViewInit, OnDestroy {
  servicios: ServicioCompleto[] = [];
  currentIndex = 0;
  itemsPerView = 3;
  isLoading = true;
  
  private readonly destroy$ = new Subject<void>();
  private ro?: ResizeObserver;

  readonly cardWidth = 372;
  readonly gap = 24;

  @ViewChild('viewportRef', { static: false }) viewportRef?: ElementRef<HTMLDivElement>;

  constructor(private servicioService: ServicioService, private http: HttpClient) {}

  @HostListener('window:resize')
  onResize(): void {
    this.calculateItemsPerViewByWindow();
    this.adjustItemsPerViewByContainer();
  }

  ngOnInit(): void {
    this.calculateItemsPerViewByWindow();
    this.loadServicios();
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

  private loadServicios(): void {
    this.isLoading = true;
    // Consumimos el endpoint de servicios completos sin tocar el servicio (igual que list-service)
    this.http.get<any>(`${environment.API_URL}/servicios/completos`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Algunos backends envían { data: [...] } y otros un array directo
          const arr = Array.isArray(data) ? data : (data as any)?.data || [];
          // Mostrar todos los servicios; si trae esta_activo=false se excluye, si no viene la propiedad se incluye
          this.servicios = (arr as ServicioCompleto[]).filter((s: any) => s?.esta_activo !== false);
          this.isLoading = false;
          this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
        },
        error: (error) => {
          console.error('Error al cargar servicios:', error);
          this.isLoading = false;
        }
      });
  }

  getImagenPrincipal(servicio: ServicioCompleto): string {
    const imagenPrincipal = servicio.imagenes?.find(img => img.es_principal);
    return imagenPrincipal?.url || servicio.imagenes?.[0]?.url || 'assets/placeholder-image.jpg';
  }

  get viewportWidth(): number {
    return this.itemsPerView * this.cardWidth + (this.itemsPerView - 1) * this.gap;
  }

  get maxIndex(): number {
    return Math.max(0, this.servicios.length - this.itemsPerView);
  }

  get totalSlides(): number {
    return Math.ceil(this.servicios.length / this.itemsPerView);
  }

  get slides(): number[] {
    return Array(this.totalSlides).fill(0).map((_, i) => i);
  }

  get currentSlide(): number {
    return Math.floor(this.currentIndex / this.itemsPerView);
  }

  get visibleServicios(): ServicioCompleto[] {
    return this.servicios.slice(this.currentIndex, this.currentIndex + this.itemsPerView);
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
