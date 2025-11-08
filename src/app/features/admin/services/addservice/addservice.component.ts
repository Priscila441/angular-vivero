import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceFormComponent } from '../shared/service-form.component';
import { ServicioService } from '../../../../core/service/servicio.service';

@Component({
  selector: 'app-addservice',
  standalone: true,
  imports: [RouterModule, CommonModule, ServiceFormComponent],
  templateUrl: './addservice.component.html',
  styleUrls: []
})
export class AddserviceComponent {

  constructor(
    private router: Router,
    private servicioService: ServicioService
  ) {}

  onFormSubmit(event: {
    servicio: {
      nombre: string;
      descripcion: string;
      informacion_extra: string;
      categoria_id: number;
    };
  }) {
    const { servicio } = event;

    // POST al backend: http://localhost:4001/api/servicios
    // El backend solo requiere: nombre, descripcion, informacion_extra, categoria_id
    this.servicioService.create(servicio as any).subscribe({
      next: (response: any) => {
        console.log('Servicio creado exitosamente:', response);
        // Navegar a la lista de servicios después de 3.5 segundos
        setTimeout(() => {
          this.router.navigate(['/admin/services']);
        }, 3500);
      },
      error: (err: any) => {
        console.error('Error al crear servicio:', err);
      }
    });
  }

  onFormCancel() {
    // Volver a la lista de servicios
    this.router.navigate(['/admin/services']);
  }
}
