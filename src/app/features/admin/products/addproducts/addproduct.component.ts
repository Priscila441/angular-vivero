import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../../core/service/producto.service';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { TemporadaService } from '../../../../core/service/temporada.service';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { Temporada } from '../../../../core/models/temporada.model';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './addproduct.component.html',
  styleUrls: []
})

// Definiciones de variable y estados del formulario 
export class AddproductComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  showSuccessModal = false;
  private closeTimer: any;
  
  // Modo de entrada de imagen: 'file' o 'url'
  imageInputMode: 'file' | 'url' = 'file';
  
  // Array para almacenar las categorías principales
  categorias: Categoria_producto[] = [];
  
  // Array para almacenar las temporadas
  temporadas: Temporada[] = [];

  //Inyecccion de dependencias (Agrego el ChangeDetectorRef porque no me detecta el cambio en el modal).
  constructor(
    private fb: FormBuilder, 
    private productoService: ProductoService,
    private categoriaService: CategoriaProductoService,
    private temporadaService: TemporadaService,
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

  // Método para manejar el cambio de archivos
  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map((f: any) => f.name).join(', ');
      this.productForm.get('imagen_url')?.setValue(fileNames);
    } else {
      this.productForm.get('imagen_url')?.setValue('');
    }
  }

  onSubmit() {
    this.submitted = true;
  this.successMessage = '';
  this.errorMessage = '';

    // Verificacion de validez del formulario.
    if (this.productForm.valid) {
      const producto = {
        ...this.productForm.value,
        categoria_id: Number(this.productForm.value.categoria_id),
        temporada_id: Number(this.productForm.value.temporada_id),
        informacion_extra: this.productForm.value.informacion_extra || ''
      };
      
      this.productoService.create(producto).subscribe({
        next: (response) => {
          this.successMessage = 'Producto agregado con éxito.';
          this.openSuccessModal();
        },
        error: (err) => {
          this.errorMessage = `Error al agregar el producto: ${err.status} - ${err.error?.message || err.error || 'Error desconocido'}`;
        }
      });
    } else {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
    }
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
}
