import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServicioService } from '../../../../../core/service/servicio.service';
import { Servicio } from '../../../../../core/models/servicio.model';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-services-images-order-form',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule],
  templateUrl: './services-images-order-form.component.html'
})
export class ServicesImagesOrderFormComponent implements OnInit {
  isLoading = true;
  servicio: Servicio | null = null;
  private servicioId: number | null = null;
  showSuccessModal = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private servicioService: ServicioService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.servicioId = id;
        this.cargarServicioCompleto(id);
      } else {
        this.isLoading = false;
      }
    });
  }

  private cargarServicioCompleto(id: number, forzarRecarga: boolean = false): void {
    this.isLoading = true;
    
    // Usar el endpoint específico para un servicio completo
    const url = `${environment.API_URL}/servicios/completos/${id}`;
    
    const headers = forzarRecarga ? new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }) : undefined;
    
    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const servicio = response.data || response;
        if (servicio) {
          // Ordenar las imágenes por el campo 'orden'
          if (servicio.imagenes && servicio.imagenes.length > 0) {
            servicio.imagenes.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
          }
          this.servicio = servicio;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    if (!this.servicio?.imagenes) return;
    moveItemInArray(this.servicio.imagenes, event.previousIndex, event.currentIndex);
  }

  guardarNuevoOrden(): void {
    if (!this.servicioId || !this.servicio?.imagenes) {
      return;
    }
    
    const ordenIds = this.servicio.imagenes.map((img: any) => img.id);
    const payload = { orden: ordenIds };
    
    const url = `${environment.API_URL}/servicios/${this.servicioId}/imagenes/orden`;
    
    this.http.put(url, payload).subscribe({
      next: (response: any) => {
        this.successMessage = 'Imágenes actualizadas';
        this.showSuccessModal = true;
        setTimeout(() => { this.showSuccessModal = false; }, 2000);
        setTimeout(() => {
          if (this.servicioId) {
            this.cargarServicioCompleto(this.servicioId, true);
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
