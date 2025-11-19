import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ServicioService } from '../../../../../core/service/servicio.service';
import { Servicio } from '../../../../../core/models/servicio.model';

@Component({
  selector: 'app-services-images-order-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services-images-order-form.component.html'
})
export class ServicesImagesOrderFormComponent implements OnInit {
  isLoading = true;
  servicio: Servicio | null = null;
  servicioId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private servicioService: ServicioService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.servicioId = id;
        this.cargarServicio(id);
      } else {
        this.isLoading = false;
      }
    });
  }

  private cargarServicio(id: number): void {
    this.isLoading = true;
    this.servicioService.getAllDetalles().subscribe({
      next: (resp: any) => {
        const servicios: Servicio[] = Array.isArray(resp) ? resp : (resp?.data || []);
        this.servicio = servicios.find((s: Servicio) => s.id === id) || null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
