import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceFormComponent } from '../shared/service-form.component';
import { ServicioService } from '../../../../core/service/servicio.service';

@Component({
  selector: 'app-addservice',
  standalone: true,
  imports: [RouterModule, CommonModule, ServiceFormComponent],
  templateUrl: './add-service.component.html',
  styleUrls: []
})
export class AddserviceComponent {
  @ViewChild('serviceFormRef') serviceForm?: ServiceFormComponent;

  constructor(
    private router: Router,
    private servicioService: ServicioService
  ) {}

  async onFormSubmit(event: {
    servicio: any;
    selectedFiles: File[];
    imageInputMode: 'file' | 'url';
    imagen_url?: string;
  }) {
    const { servicio, selectedFiles, imageInputMode, imagen_url } = event;

    this.servicioService.create(servicio).subscribe({
      next: async (response: any) => {
        const servicioId = response?.data?.id || response?.id;
        if (!servicioId) {
          console.error('No se recibió ID de servicio tras crear');
          this.onServiceCreated({});
          return;
        }

        try {
          const formData = await this.buildImagesFormData(imageInputMode, selectedFiles, imagen_url);
          if (formData) {
            this.servicioService.uploadImagenes(servicioId, formData).subscribe({
              next: () => {
                if (this.serviceForm) {
                  this.serviceForm.successMessage = 'Servicio agregado con éxito.';
                  this.serviceForm.openSuccessModal();
                }
                this.onServiceCreated({ id: servicioId });
              },
              error: (err) => {
                console.error('Error al subir imágenes del servicio:', err);
                if (this.serviceForm) {
                  this.serviceForm.successMessage = 'Servicio agregado (advertencia en imágenes).';
                  this.serviceForm.openSuccessModal();
                }
                this.onServiceCreated({ id: servicioId });
              }
            });
          } else {
            if (this.serviceForm) {
              this.serviceForm.successMessage = 'Servicio agregado con éxito.';
              this.serviceForm.openSuccessModal();
            }
            this.onServiceCreated({ id: servicioId });
          }
        } catch (e) {
          console.error('Error procesando imagen desde URL para servicio:', e);
          if (this.serviceForm) {
            this.serviceForm.successMessage = 'Servicio agregado (error procesando imagen).';
            this.serviceForm.openSuccessModal();
          }
          this.onServiceCreated({ id: servicioId });
        }
      },
      error: (err) => {
        console.error('Error al crear servicio:', err);
      }
    });
  }

  onFormCancel() {
    // Volver a la lista de servicios
    this.router.navigate(['/admin/services']);
  }

  private onServiceCreated(_data: any) {
    setTimeout(() => {
      this.router.navigate(['/admin/services']);
    }, 3500);
  }

  // Construye FormData con 'files' desde archivos o URL; retorna null si no hay nada que enviar
  private async buildImagesFormData(
    mode: 'file' | 'url',
    files: File[],
    imagenUrl?: string
  ): Promise<FormData | null> {
    const formData = new FormData();
    if (mode === 'file' && files?.length) {
      files.forEach(f => formData.append('files', f));
    } else if (mode === 'url' && imagenUrl) {
      const filename = imagenUrl.split('/').pop() || 'imagen.jpg';
      const file = await this.convertUrlToFile(imagenUrl, filename);
      formData.append('files', file);
    }
    const hasFiles = (formData as any).has ? (formData as any).has('files') : false;
    return hasFiles ? formData : null;
  }

  private async convertUrlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error al descargar la imagen: ${response.statusText}`);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }
}
