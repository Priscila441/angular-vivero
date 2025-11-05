import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioService } from '../../../../core/service/servicio.service';
import { Servicio } from '../../../../core/models/servicio.model';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-detail.html',
})
export class ServiceDetail implements OnInit {

  servicio: Servicio | null = null;
  loading = false;
  errorMessage = '';
  hoverImage = false;
  showModal = false;
  modalServiceName = '';
  modalCategoriaName = '';
  consultaAgregada = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicioService: ServicioService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadService(id);
  }

  loadService(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.servicioService.getDetallesById(id).subscribe({
      next: (response) => {
        if (response?.data) {
          this.servicio = response.data;
        } else {
          this.errorMessage = 'No se encontró la información del servicio.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Ocurrió un error al obtener el detalle del servicio.';
        this.loading = false;
      },
    });
  }

  getPrimaryImage(): string {
    const principal = this.servicio?.imagenes?.find((img) => img.es_principal);
    return principal ? principal.url : 'assets/img/placeholder-servicio.jpg';
  }

  getSecondaryImage(): string | null {
    const secundaria = this.servicio?.imagenes?.find((img) => !img.es_principal);
    return secundaria ? secundaria.url : null;
  }

  parseExtra(extra: string): any {
    try {
      return JSON.parse(extra);
    } catch {
      return {};
    }
  }

  onAgregarConsulta(): void {
    if (!this.servicio) return;
    this.consultaAgregada = true;
    this.showModal = true;
    this.modalServiceName = this.servicio.nombre;
    this.modalCategoriaName = this.servicio.categoria_id.toString();

    setTimeout(() => (this.showModal = false), 3000);
  }

  verContacto(): void {
    this.router.navigate(['/contacto']);
  }
}
