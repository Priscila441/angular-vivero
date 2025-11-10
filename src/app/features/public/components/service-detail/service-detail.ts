import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Servicio } from '../../../../core/models/servicio.model';
import { ServicioService } from '../../../../core/service/servicio.service';
import { catchError, of, Subscription } from 'rxjs';
import { ConsultaService } from '../../../../core/service/consulta.service';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-detail.html',
})
export class ServiceDetail implements OnInit, OnDestroy {
  service!: Servicio;
  loading = true;
  errorMessage = '';
  hoverImage = false;
  subs: Subscription[] = [];

  // 🔹 Propiedades para consulta
  consultaAgregada = false;
  showModal = false;
  modalServiceName = '';
  modalCategoriaName = '';

  constructor(
    private route: ActivatedRoute,
    private servicioService: ServicioService,
    private router: Router,
    private consultaService: ConsultaService
  ) {}

  ngOnInit(): void {
    const sub = this.route.params.subscribe(params => {
      const id = +params['serviceId'];
      this.loadService(id);
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  loadService(id: number) {
    this.loading = true;
    this.errorMessage = '';
    const sub = this.servicioService
      .getDetallesById(id)
      .pipe(
        catchError(err => {
          this.loading = false;
          this.errorMessage =
            err?.error?.message || 'Error al cargar el servicio.';
          console.error('Error getDetallesById', err);
          return of(null);
        })
      )
      .subscribe(res => {
        this.loading = false;
        if (!res) return;
        if (res.success === false) {
          this.errorMessage = res.message || 'No se pudo obtener el servicio.';
          return;
        }
        this.service = res.data;
      });
    this.subs.push(sub);
  }

  getPrimaryImage(): string {
    if (!this.service?.imagenes?.length) return '';
    const main =
      this.service.imagenes.find(i => i.es_principal) ??
      this.service.imagenes[0];
    return main.url;
  }

  getSecondaryImage(): string | null {
    if (!this.service?.imagenes || this.service.imagenes.length < 2)
      return null;
    const main =
      this.service.imagenes.find(i => i.es_principal) ??
      this.service.imagenes[0];
    const second = this.service.imagenes.find(i => i !== main);
    return second ? second.url : null;
  }

  parseExtra(info: string | object): string[] {
    try {
      const parsed = typeof info === 'string' ? JSON.parse(info) : info;
      if (typeof parsed === 'string') {
        return parsed
          .replace(/[{}"]/g, '')
          .split('\n')
          .map(line => line.trim().replace(/^•\s*/, ''))
          .filter(line => line.length > 0);
      }
      return Object.values(parsed)
        .map(v => String(v).trim().replace(/^•\s*/, ''))
        .filter(Boolean);
    } catch {
      if (typeof info === 'string') {
        return info
          .replace(/[{}"]/g, '')
          .split('\n')
          .map(line => line.trim().replace(/^•\s*/, ''))
          .filter(line => line.length > 0);
      }
      return [];
    }
  }

  // 🔹 Funcionalidad del botón de consulta
  onAgregarConsulta() {
    this.modalServiceName = this.service?.nombre || '';
    this.consultaService.agregarServicio (this.modalServiceName);

    this.consultaAgregada = true;
    this.showModal = true;

    // Ocultar automáticamente el toast
    setTimeout(() => {
      this.showModal = false;
    }, 3000);
  }

  verContacto() {
    this.router.navigate(['/contacto']);
  }
}
