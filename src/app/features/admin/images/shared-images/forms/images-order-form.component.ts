import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductoService } from '../../../../../core/service/producto.service';
import { ProductoDetalles } from '../../../../../core/models/producto_detalles.model';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-images-order-form',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule],
  templateUrl: './images-order-form.component.html'
})
export class ImagesOrderFormComponent implements OnInit {
  isLoading = true;
  producto: ProductoDetalles | null = null;
  private productoId: number | null = null;
  showSuccessModal = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute, 
    private productoService: ProductoService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.productoId = id;
        this.cargarProductoCompleto(id);
      } else {
        this.isLoading = false;
      }
    });
  }

  private cargarProductoCompleto(id: number, forzarRecarga: boolean = false): void {
    this.isLoading = true;
    
    if (forzarRecarga) {
      const timestamp = new Date().getTime();
      const url = `${environment.API_URL}/productos/completos?_t=${timestamp}`;
      
      const headers = new HttpHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      this.http.get<any>(url, { headers }).subscribe({
        next: (response) => {
          const productos = Array.isArray(response) ? response : (response.data || []);
          const encontrado = productos.find((p: ProductoDetalles) => p.id === id);
          if (encontrado) {
            // Ordenar las imágenes por el campo 'orden'
            if (encontrado.imagenes && encontrado.imagenes.length > 0) {
              encontrado.imagenes.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
            }
            this.producto = encontrado;
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Carga normal: usar servicio
      this.productoService.getAllDetallesCompletos().subscribe({
        next: (productos) => {
          const encontrado = productos.find(p => p.id === id);
          if (encontrado) {
            // Ordenar imágenes por el campo 'orden'
            if (encontrado.imagenes && encontrado.imagenes.length > 0) {
              encontrado.imagenes.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
            }
            this.producto = encontrado;
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  drop(event: CdkDragDrop<any[]>): void {
    if (!this.producto?.imagenes) return;
    moveItemInArray(this.producto.imagenes, event.previousIndex, event.currentIndex);
  }

  guardarNuevoOrden(): void {
    if (!this.productoId || !this.producto?.imagenes) {
      return;
    }
    
    const ordenIds = this.producto.imagenes.map((img: any) => img.id);
    const payload = { orden: ordenIds };
    
    const url = `${environment.API_URL}/productos/${this.productoId}/imagenes/orden`;
    
    this.http.put(url, payload).subscribe({
      next: (response: any) => {
        this.successMessage = 'Imágenes actualizadas';
        this.showSuccessModal = true;
        setTimeout(() => { this.showSuccessModal = false; }, 2000);
        setTimeout(() => {
          if (this.productoId) {
            this.cargarProductoCompleto(this.productoId, true);
          }
        }, 1500);
      },
      error: () => {
        this.errorMessage = 'Error al guardar el orden de las imágenes';
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      }
    });
  }

  cancelar(): void {
    window.history.back();
  }
}
