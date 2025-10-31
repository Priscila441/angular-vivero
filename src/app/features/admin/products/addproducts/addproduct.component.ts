import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { TemporadaService } from '../../../../core/service/temporada.service';
import { ProductoService } from '../../../../core/service/producto.service';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { Temporada } from '../../../../core/models/temporada.model';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './addproduct.component.html',
  styleUrls: []
})

// Definiciones de variable y estados del modal 
export class AddproductComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  submitted = false;
  showSuccessModal = false;
  private closeTimer: any;
  errorMessage = '';
  successMessage = '';
  imageInputMode: 'file' | 'url' = 'file';
  selectedFiles: File[] = [];
  
  // Array para almacenar las categorías principales
  categorias: Categoria_producto[] = [];
  
  // Array para almacenar las temporadas
  temporadas: Temporada[] = [];

  //Inyección de dependencias (Agrego el ChangeDetectorRef porque no me detecta el cambio en el modal).
  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaProductoService,
    private temporadaService: TemporadaService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  // Creacion del formulario con validaciones.
  ngOnInit() {
    this.productForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen_url: ['', Validators.required],
      categoria_id: ['', Validators.required],
      temporada_id: ['', Validators.required],
      informacion_extra: ['', [Validators.required, Validators.minLength(10)]]
    });
    
    // Cargar las categorías principales al inicializar el componente
    this.cargarCategorias();
    // Cargar las temporadas al inicializar el componente
    this.cargarTemporadas();
  }
  
  // Método para cargar las categorías desde el backend
  cargarCategorias() {
    this.categoriaService.getAll().subscribe({
      next: (categorias) => {
        // Filtrar solo las categorías principales (tipo === 'principal')
        this.categorias = categorias.filter(cat => cat.tipo === 'principal');
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.errorMessage = 'Error al cargar las categorías';
      }
    });
  }
  
  // Método para cargar las temporadas desde el backend
  cargarTemporadas() {
    this.temporadaService.getAll().subscribe({
      next: (response: any) => {
        // Extraer el array de temporadas desde response.data
        if (response && response.data) {
          this.temporadas = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar temporadas:', err);
        this.errorMessage = 'Error al cargar las temporadas';
      }
    });
  }

  // Metodo para verificar si un campo es invalido y mostrar mensajes de error.
  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && this.submitted);
  }

  openSuccessModal() {
    this.showSuccessModal = true;
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
    this.closeTimer = setTimeout(() => this.closeSuccessModal(), 3000);
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
    this.productForm.reset();
    this.submitted = false;
    // Forzar detección de cambios después de cerrar
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }

  // Método para capturar archivos seleccionados
  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (files.length > 5) {
      this.errorMessage = 'Solo puedes seleccionar un máximo de 5 imágenes';
      return;
    }
    this.selectedFiles = files;
    console.log('Imágenes seleccionadas:', this.selectedFiles);
  }

  // Método para convertir URL a File
  async convertUrlToFile(url: string, filename: string): Promise<File> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al descargar la imagen: ${response.statusText}`);
      }
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error al convertir URL a archivo:', error);
      throw error;
    }
  }

  // Método para enviar el formulario
  async onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones básicas del formulario
    if (this.productForm.get('nombre')?.invalid || 
        this.productForm.get('descripcion')?.invalid ||
        this.productForm.get('informacion_extra')?.invalid ||
        this.productForm.get('categoria_id')?.invalid ||
        this.productForm.get('temporada_id')?.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    // Validar que haya imágenes (archivos o URL)
    if (this.imageInputMode === 'file' && this.selectedFiles.length === 0) {
      this.errorMessage = 'Por favor selecciona al menos una imagen';
      return;
    }

    if (this.imageInputMode === 'url' && !this.productForm.get('imagen_url')?.value) {
      this.errorMessage = 'Por favor ingresa una URL de imagen';
      return;
    }

    // Preparar el objeto producto (sin imagen_url)
    const producto: any = {
      nombre: this.productForm.get('nombre')?.value?.trim(),
      descripcion: this.productForm.get('descripcion')?.value?.trim(),
      informacion_extra: this.productForm.get('informacion_extra')?.value?.trim(),
      categoria_id: Number(this.productForm.get('categoria_id')?.value),
      temporada_id: Number(this.productForm.get('temporada_id')?.value)
    };

    console.log('Enviando producto:', producto);
    console.log('Tipos:', {
      categoria_id: typeof producto.categoria_id,
      temporada_id: typeof producto.temporada_id
    });

    // Paso 1: Crear el producto
    this.productoService.create(producto).subscribe({
      next: async (response: any) => {
        const productoId = response.data?.id || response.id;
        console.log('Producto creado con ID:', productoId);

        try {
          // Paso 2: Preparar archivos para subir
          const formData = new FormData();

          if (this.imageInputMode === 'file') {
            // Modo archivos: agregar todos los archivos seleccionados
            this.selectedFiles.forEach((file) => {
              formData.append('files', file);
            });
          } else {
            // Modo URL: descargar la imagen y convertirla a File
            const imageUrl = this.productForm.get('imagen_url')?.value;
            console.log('Descargando imagen desde URL:', imageUrl);
            
            const filename = imageUrl.split('/').pop() || 'imagen.jpg';
            const file = await this.convertUrlToFile(imageUrl, filename);
            formData.append('files', file);
          }

          // Paso 3: Subir las imágenes
          this.productoService.uploadImagenes(productoId, formData).subscribe({
            next: () => {
              this.successMessage = 'Producto e imágenes agregados con éxito.';
              this.openSuccessModal();
              this.selectedFiles = [];
            },
            error: (err) => {
              console.error('Error al subir imágenes:', err);
              this.successMessage = 'El producto se creó correctamente.';
              this.errorMessage = `Advertencia: Hubo un error al subir las imágenes: ${err.status} - ${err.error?.message || 'Error desconocido'}`;
              this.openSuccessModal();
            }
          });
        } catch (error) {
          console.error('Error al procesar la imagen:', error);
          this.errorMessage = 'Error al procesar la imagen. Verifica que la URL sea válida y accesible.';
        }
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        console.error('Detalle completo del error:', JSON.stringify(err.error, null, 2));
        console.error('Status:', err.status);
        console.error('StatusText:', err.statusText);
        
        // Mostrar errores de validación específicos si existen
        if (err.error?.errors && Array.isArray(err.error.errors)) {
          console.error('Errores de validación:', err.error.errors);
          const validationErrors = err.error.errors.map((e: any) => e.message || e).join(', ');
          this.errorMessage = `Error de validación: ${validationErrors}`;
        } else if (err.status === 409) {
          this.errorMessage = `El producto ya existe: ${err.error?.message || 'Ya existe un producto con ese nombre'}`;
        } else {
          this.errorMessage = `Error al agregar el producto: ${err.status} - ${err.error?.message || err.error?.error || err.message || 'Error desconocido'}`;
        }
      }
    });
  }
}
