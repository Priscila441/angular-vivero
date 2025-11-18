import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductoService } from '../../../../../core/service/producto.service';
import { ProductoDetalles } from '../../../../../core/models/producto_detalles.model';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-images-order-form',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule],
  templateUrl: './images-order-form.component.html'
})
export class ImagesOrderFormComponent implements OnInit {
  isLoading = true;
  producto: ProductoDetalles | null = null;
  private productoId: number | null = null;

  constructor(
    private route: ActivatedRoute, 
    private productoService: ProductoService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.productoId = id;
        this.cargarProductoCompleto(id);
      } else {
        this.isLoading = false;
      }
    });
  }

  private cargarProductoCompleto(id: number): void {
    this.isLoading = true;
    // Fallback robusto: si el método nuevo no está disponible, usar getAllDetallesCompletos
    if (typeof (this.productoService as any).getProductoCompletoById === 'function') {
      (this.productoService as any).getProductoCompletoById(id).subscribe({
        next: (data: ProductoDetalles) => {
          this.producto = data as ProductoDetalles;
          this.isLoading = false;
        },
        error: () => {
          this.producto = null;
          this.isLoading = false;
        }
      });
    } else {
      // Fallback: cargar todos y filtrar
      this.productoService.getAllDetallesCompletos().subscribe({
        next: (lista: ProductoDetalles[]) => {
          this.producto = lista.find(p => p.id === id) || null;
          this.isLoading = false;
        },
        error: () => {
          this.producto = null;
          this.isLoading = false;
        }
      });
    }
  }

  drop(event: CdkDragDrop<any[]>): void {
    if (!this.producto?.imagenes) return;
    moveItemInArray(this.producto.imagenes, event.previousIndex, event.currentIndex);
  }

  guardarNuevoOrden(): void {
    if (!this.productoId || !this.producto?.imagenes) {
      return;
    }
    
    const ordenIds = this.producto.imagenes.map(img => img.id);
    const payload = { orden: ordenIds };
    
    // Usar API_URL (4001) donde está el endpoint de ordenamiento
    const url = `${environment.API_URL}/productos/${this.productoId}/imagenes/orden`;
    
    this.http.put(url, payload).subscribe({
      next: () => {
        alert('✅ Orden de imágenes guardado exitosamente');
      },
      error: (err: any) => {
        alert('❌ Error al guardar: ' + (err.error?.message || err.message || 'Ver consola'));
        console.error('Error completo:', err);
      }
    });
  }
}
