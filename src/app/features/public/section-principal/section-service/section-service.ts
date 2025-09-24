import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { Categoria_servicio } from '../../../../core/models/categoria_servicio.model';
import { CategoriaServicioService } from '../../../../core/service/categoria_servicio.service';
import { Servicio } from '../../../../core/models/servicio.model';
import { ServicioService } from '../../../../core/service/servicio.service';

@Component({
  selector: 'app-section-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-service.html'
})
export class SectionService implements OnInit {
  categorias: Categoria_servicio[] = [];
  errorMessage: string = '';
  loading: boolean = true;
  servicios: Servicio [] = [];

  constructor(
    private router: Router,
    private categoriaService: CategoriaServicioService,
    private servicioService  : ServicioService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadServices();
  }

  loadCategorias() {
    this.loading = true;
    this.categoriaService.getAll().subscribe({
      next: res => {
        this.categorias = res;
        this.loading = false;
        if (this.categorias.length === 0) {
          this.errorMessage = 'No se han encontrado categorías de servicios.';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error al cargar las categorías de servicios. Intente más tarde.';
      }
    });
  }

  goToCategory(categoryId: number) {
    this.router.navigate(['/servicios/categoria', categoryId]);
  }

  loadServices(){
    this.loading = true;
    this.servicioService.getAll().subscribe({
      next: res => {
        this.servicios = res;
        this.loading = false;
        if (this.servicios.length === 0){
          this.errorMessage = 'No se han encontrado servicios.';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error al cargar los servicios. Intente más tarde.';
      }

    })
  }

  goToService(serviceId: number) {
    this.router.navigate(['/servicio', serviceId]);
  }
}
