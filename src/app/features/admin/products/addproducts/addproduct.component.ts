import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../../core/service/producto.service';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
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

  //Inyecccion de dependencias.
  constructor(private fb: FormBuilder, private productoService: ProductoService) {}

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
        next: () => {
          this.successMessage = 'Producto agregado con éxito.';
          this.productForm.reset();
          this.submitted = false;
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

  // Modal helpers
  openSuccessModal() {
    this.showSuccessModal = true;
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
  }

  ngOnDestroy(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }
}
