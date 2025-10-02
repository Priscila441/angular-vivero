import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../../core/service/producto.service';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './addproduct.component.html',
  styleUrls: []
})
export class AddproductComponent implements OnInit {
  productForm!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private productoService: ProductoService) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      nombre: [''],
      descripcion: [''],
      imagen_url: [''],
      categoria_id: [''],
      temporada_id: [''],
      informacion_extra: [''] 
    });
  }

  onSubmit() {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.productForm.valid) {
      const producto = {
        ...this.productForm.value,
        categoria_id: Number(this.productForm.value.categoria_id),
        temporada_id: Number(this.productForm.value.temporada_id),
        informacion_extra: this.productForm.value.informacion_extra || ''
      };
      
      console.log('Enviando producto:', producto);
      
      this.productoService.create(producto).subscribe({
        next: () => {
          this.successMessage = 'Producto agregado correctamente';
          this.productForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          this.errorMessage = `Error al agregar el producto: ${err.status} - ${err.error?.message || err.error || 'Error desconocido'}`;
          console.error('Error completo:', err);
          console.error('Datos enviados:', producto);
        }
      });
    } else {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && this.submitted);
  }
}
