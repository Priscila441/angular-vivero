import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductFormComponent } from '../shared/product-form/product-form.component';
import { ProductoService } from '../../../../core/service/producto.service';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-editproduct',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductFormComponent],
  templateUrl: './edit-product.component.html',
  styleUrls: []
})
export class EditproductComponent implements OnInit {
  @ViewChild('productFormRef') productForm?: ProductFormComponent;
  productId!: number;
  productData: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private categoriaService: CategoriaProductoService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Obtener el ID del producto desde la ruta
    this.route.params.subscribe(params => {
      this.productId = Number(params['id']);
      if (this.productId) {
        this.cargarProducto();
      } else {
        console.error('No se proporcionó ID de producto');
        this.router.navigate(['/admin/products']);
      }
    });
  }

  // Cargar datos del producto
  cargarProducto() {
    this.isLoading = true;
    const url = `${environment.API_URL}/productos/completos/${this.productId}`;
    const urlSubcategorias = `${environment.API_URL}/categorias/subcategorias`;
    
    forkJoin({
      producto: this.http.get<any>(url),
      categorias: this.categoriaService.getAll(),
      subcategorias: this.http.get<any>(urlSubcategorias)
    }).subscribe({
      next: ({ producto, categorias, subcategorias }) => {
        const productoCompleto = producto?.data || producto;
        const todasLasSubcategorias = subcategorias?.data || [];
        const todasLasCategorias = [...categorias, ...todasLasSubcategorias];
        
        this.productData = {
          nombre: productoCompleto.nombre,
          descripcion: productoCompleto.descripcion,
          informacion_extra: productoCompleto.informacion_extra,
          imagen_url: productoCompleto.imagen_url || '',
          imagenes: productoCompleto.imagenes || []
        };

        if (productoCompleto.categoria) {
          const categoriaIdProducto = productoCompleto.categoria.id;
          const categoriaEncontrada = todasLasCategorias.find(cat => cat.id === categoriaIdProducto);
          
          if (categoriaEncontrada) {
            if (categoriaEncontrada.id_padre && categoriaEncontrada.id_padre > 0) {
              this.productData.categoria_id = categoriaEncontrada.id_padre;
              this.productData.subcategoria_id = categoriaEncontrada.id;
            } else {
              this.productData.categoria_id = categoriaEncontrada.id;
            }
          } else {
            this.productData.categoria_id = categoriaIdProducto;
          }
        }

        if (productoCompleto.temporada) {
          this.productData.temporada_id = productoCompleto.temporada.id;
        }

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar producto:', err);
        this.isLoading = false;
        this.router.navigate(['/admin/products']);
      }
    });
  }

  // Manejar el éxito del formulario
  onProductUpdated(productData: any) {
    console.log('Producto actualizado:', productData);
    // Mostrar modal de éxito en el formulario y luego navegar
    if (this.productForm) {
      this.productForm.successMessage = 'Producto editado con éxito.';
      this.productForm.openSuccessModal();
    }
    setTimeout(() => {
      this.router.navigate(['/admin/products']);
    }, 3500);
  }

  // Manejar la cancelación
  onCancel() {
    this.router.navigate(['/admin/products']);
  }

  async onFormSubmit(event: {
    producto: any;
    selectedFiles: File[];
    imageInputMode: 'file' | 'url';
    imagen_url?: string;
  }) {
    const { producto, selectedFiles, imageInputMode, imagen_url } = event;
    if (!this.productId) {
      console.error('Falta productId para actualizar');
      return;
    }

    // Mapeo explícito al DTO de actualización requerido por 4001 (sin fotos)
    const updateDto = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      informacion_extra: producto.informacion_extra,
      categoria_id: producto.categoria_id,
      temporada_id: producto.temporada_id
    };

    // Actualización principal por PUT en 4001
    this.http.put<void>(`${environment.API_URL}/productos/${this.productId}`, updateDto).subscribe({
      next: async () => {
        try {
          // IDs originales vs actuales (quitar del backend las que fueron removidas en UI)
          const originalIds: number[] = (this.productData?.imagenes || []).map((img: any) => img.id).filter((id: any) => !!id);
          const remainingIds: number[] = (this.productForm?.existingImages || []).map((img: any) => img.id).filter((id: any) => !!id);
          const removedIds = originalIds.filter((id: number) => !remainingIds.includes(id));

          if (removedIds.length > 0) {
            const deletes$ = removedIds.map((imgId) => this.tryDeleteImage(imgId));
            await new Promise<void>((resolve) => {
              forkJoin(deletes$).subscribe({
                next: () => resolve(),
                error: () => resolve() // no bloquear por errores
              });
            });
          }

          // Solo subir imágenes NUEVAS (no re-subir las existentes)
          const filesToSend: File[] = [];
          if (imageInputMode === 'file' && selectedFiles?.length) {
            filesToSend.push(...selectedFiles);
          }
          if (imageInputMode === 'url' && imagen_url) {
            const filename = imagen_url.split('/').pop() || 'imagen.jpg';
            const file = await this.convertUrlToFile(imagen_url, filename);
            filesToSend.push(file);
          }

          if (filesToSend.length > 0) {
            const formData = new FormData();
            filesToSend.forEach(f => formData.append('files', f));
            this.productoService.uploadImagenes(this.productId, formData).subscribe({
              next: () => this.onProductUpdated({ id: this.productId }),
              error: (err) => {
                console.error('Error al subir imágenes:', err);
                this.onProductUpdated({ id: this.productId });
              }
            });
          } else {
            // No hay nuevas imágenes que subir; finalizamos
            this.onProductUpdated({ id: this.productId });
          }
        } catch (e) {
          console.error('Error procesando imágenes:', e);
          this.onProductUpdated({ id: this.productId });
        }
      },
      error: (err) => {
        console.error('Error al actualizar producto (datos básicos):', err);
      }
    });
  }

  private async convertUrlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error al descargar la imagen: ${response.statusText}`);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }

  // Intenta borrar una imagen probando posibles endpoints; no falla si ninguno existe
  private tryDeleteImage(imageId: number) {
    const c1 = `${environment.API_URL}/productos/${this.productId}/imagenes/${imageId}`;
    const c2 = `${environment.API_URL}/productos/imagenes/${imageId}`;
    const c3 = `${environment.API_URL}/imagenes/${imageId}`;

    const del$ = (url: string) => this.http.delete<void>(url);
    return del$(c1).pipe(
      catchError(() => del$(c2).pipe(
        catchError(() => del$(c3).pipe(
          catchError(() => of(void 0))
        ))
      ))
    );
  }
}
