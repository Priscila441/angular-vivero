import { Component, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductFormComponent } from '../shared/product-form/product-form.component';
import { ProductoService } from '../../../../core/service/producto.service';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [RouterModule, CommonModule, ProductFormComponent],
  templateUrl: './add-product.component.html', 
  styleUrls: []
})
export class AddproductComponent {
  
  @ViewChild('productFormRef') productForm?: ProductFormComponent;

  constructor(private router: Router, private productoService: ProductoService) {}


  onProductCreated(productData: any) {
    console.log('Producto creado exitosamente:', productData);
    setTimeout(() => {
      this.router.navigate(['/admin/products']);
    }, 3500);
  }

  // Manejar la cancelación del formulario
  onFormCancel() {
    this.router.navigate(['/admin/products']);
  }

  async onFormSubmit(event: {
    producto: any;
    selectedFiles: File[];
    imageInputMode: 'file' | 'url';
    imagen_url?: string;
  }) {
    const { producto, selectedFiles, imageInputMode, imagen_url } = event;
    
    this.productoService.create(producto).subscribe({
      next: async (response: any) => {
        const productoId = response?.data?.id || response?.id;
        if (!productoId) {
          console.error('No se recibió ID de producto tras crear');
          this.onProductCreated({});
          return;
        }

        try {
          const formData = new FormData();
          if (imageInputMode === 'file' && selectedFiles?.length) {
            selectedFiles.forEach(f => formData.append('files', f));
          } else if (imageInputMode === 'url' && imagen_url) {
            const filename = imagen_url.split('/').pop() || 'imagen.jpg';
            const file = await this.convertUrlToFile(imagen_url, filename);
            formData.append('files', file);
          }

          const hasFiles = (formData as any).has ? (formData as any).has('files') : false;
          if (hasFiles) {
            this.productoService.uploadImagenes(productoId, formData).subscribe({
              next: () => {
                // Mostrar modal de éxito en el formulario y luego navegar
                if (this.productForm) {
                  this.productForm.successMessage = 'Producto agregado con éxito.';
                  this.productForm.openSuccessModal();
                }
                this.onProductCreated({ id: productoId });
              },
              error: (err) => {
                console.error('Error al subir imágenes:', err);
                if (this.productForm) {
                  this.productForm.successMessage = 'Producto agregado (advertencia en imágenes).';
                  this.productForm.openSuccessModal();
                }
                // Aun así considerar creado y navegar
                this.onProductCreated({ id: productoId });
              }
            });
          } else {
            if (this.productForm) {
              this.productForm.successMessage = 'Producto agregado con éxito.';
              this.productForm.openSuccessModal();
            }
            this.onProductCreated({ id: productoId });
          }
        } catch (e) {
          console.error('Error procesando imagen desde URL:', e);
          if (this.productForm) {
            this.productForm.successMessage = 'Producto agregado (error procesando imagen).';
            this.productForm.openSuccessModal();
          }
          this.onProductCreated({ id: productoId });
        }
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        // Mantenerse en la página para que el usuario corrija
      }
    });
  }

  private async convertUrlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error al descargar la imagen: ${response.statusText}`);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }
}
