import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServiceFormComponent } from '../shared/service-form.component';
import { ServicioService } from '../../../../core/service/servicio.service';
import { CategoriaServicioService } from '../../../../core/service/categoria_servicio.service';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-editservice',
  standalone: true,
  imports: [CommonModule, RouterModule, ServiceFormComponent],
  templateUrl: './edit-service.component.html',
  styleUrls: []
})
export class EditserviceComponent implements OnInit {
  @ViewChild('serviceFormRef') serviceForm?: ServiceFormComponent;

  serviceId!: number;
  serviceData: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicioService: ServicioService,
    private categoriaService: CategoriaServicioService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.serviceId = Number(params['id']);
      if (this.serviceId) {
        this.cargarServicio();
      } else {
        console.error('No se proporcionó ID de servicio');
        this.router.navigate(['/admin/services']);
      }
    });
  }

  private cargarServicio() {
    this.isLoading = true;
    const urlServicio = `${environment.API_URL}/servicios/completos/${this.serviceId}`;

    forkJoin({
      servicio: this.http.get<any>(urlServicio),
      categorias: this.categoriaService.getAll()
    }).subscribe({
      next: ({ servicio, categorias }) => {
        const servicioCompleto = servicio?.data || servicio || {};

        // Mapear datos iniciales para el formulario compartido
        this.serviceData = {
          nombre: servicioCompleto.nombre,
          descripcion: servicioCompleto.descripcion,
          informacion_extra: servicioCompleto.informacion_extra,
          categoria_id: servicioCompleto.categoria?.id ?? servicioCompleto.categoria_id ?? '',
          imagen_url: '',
          // Precargar imágenes existentes del servicio
          imagenes: (servicioCompleto.imagenes || []).map((img: any) => ({
            id: img.id,
            url: img.url,
            es_principal: img.es_principal,
            orden: img.orden
          }))
        };

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar servicio:', err);
        this.isLoading = false;
        this.router.navigate(['/admin/services']);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/services']);
  }

  async onFormSubmit(event: {
    servicio: any;
    selectedFiles: File[];
    imageInputMode: 'file' | 'url';
    imagen_url?: string;
  }) {
    const { servicio, selectedFiles, imageInputMode, imagen_url } = event;
    if (!this.serviceId) {
      console.error('Falta serviceId para actualizar');
      return;
    }

    // Construir PATCH solo con cambios
    const normalize = (v: any) => (typeof v === 'string' ? v.trim() : v);
    const initial = this.serviceData || {};
    const patchDto: any = {};
    (['nombre','descripcion','informacion_extra','categoria_id'] as const).forEach((k) => {
      const curr = normalize(servicio[k]);
      const prev = normalize(initial[k]);
      if (curr !== prev && curr !== undefined && curr !== null && curr !== '') {
        patchDto[k] = curr;
      }
    });

    // Detectar operaciones de imágenes
    const originalIds: number[] = (this.serviceData?.imagenes || [])
      .map((img: any) => img.id)
      .filter((id: any) => !!id);
    const uiExistingIds: number[] = this.serviceForm?.existingImages?.map((img: any) => img.id).filter((id: any) => !!id) || [];
    const removedIds = originalIds.filter((id: number) => !uiExistingIds.includes(id));
    const hasNewFiles = imageInputMode === 'file' && selectedFiles?.length > 0;
    const hasNewUrl = imageInputMode === 'url' && !!imagen_url;
    const hasImageOps = removedIds.length > 0 || hasNewFiles || hasNewUrl;

    const doImages = async () => {
      if (removedIds.length > 0) {
        const deletes$ = removedIds.map((imgId) => this.tryDeleteImage(imgId));
        await new Promise<void>((resolve) => {
          forkJoin(deletes$).subscribe({ next: () => resolve(), error: () => resolve() });
        });
      }

      const formData = await this.buildImagesFormData(imageInputMode, selectedFiles, imagen_url);
      if (formData) {
        this.servicioService.uploadImagenes(this.serviceId, formData).subscribe({
          next: () => this.onServiceUpdated({ id: this.serviceId }),
          error: () => this.onServiceUpdated({ id: this.serviceId })
        });
      } else {
        this.onServiceUpdated({ id: this.serviceId });
      }
    };

    // Sin cambios de datos ni imágenes
    if (Object.keys(patchDto).length === 0 && !hasImageOps) {
      this.onServiceUpdated({ id: this.serviceId });
      return;
    }

    // Si hay patch: ejecutarlo y luego imágenes; si no, solo imágenes
    if (Object.keys(patchDto).length > 0) {
      this.http.patch<void>(`${environment.API_URL}/servicios/${this.serviceId}`, patchDto).subscribe({
        next: () => {
          if (hasImageOps) doImages(); else this.onServiceUpdated({ id: this.serviceId });
        },
        error: (err) => {
          console.error('Error al actualizar servicio (PATCH):', err);
          if (hasImageOps) doImages(); else this.onServiceUpdated({ id: this.serviceId });
        }
      });
    } else {
      await doImages();
    }
  }

  private onServiceUpdated(_data: any) {
    if (this.serviceForm) {
      this.serviceForm.successMessage = 'Servicio editado con éxito.';
      this.serviceForm.openSuccessModal();
    }
    setTimeout(() => {
      this.router.navigate(['/admin/services']);
    }, 3500);
  }

  private async convertUrlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error al descargar la imagen: ${response.statusText}`);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
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

  // Elimina una imagen del servicio usando el endpoint correcto
  private tryDeleteImage(imageId: number) {
    return this.servicioService.deleteImagenServicio(imageId).pipe(
      catchError((err) => {
        console.error(`Error al eliminar imagen ${imageId}:`, err);
        return of(void 0);
      })
    );
  }
}
