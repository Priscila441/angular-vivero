import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TemporadaService } from '../../../core/service/temporada.service';
import { Temporada } from '../../../core/models/temporada.model';

@Component({
  selector: 'app-seasons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seasons.component.html',
  styleUrls: []
})
export class SeasonsComponent implements OnInit {
  temporadas: any[] = [];
  
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  private readonly coloresTemporadas: Record<number, string> = {
    1: 'bg-orange-100 text-orange-800',   
    2: 'bg-yellow-100 text-yellow-800',  
    3: 'bg-blue-100 text-blue-800',       
    4: 'bg-green-100 text-green-800',     
    5: 'bg-rose-100 text-rose-800'        
  };

  constructor(
    private http: HttpClient,
    private temporadaService: TemporadaService
  ) {}

  ngOnInit(): void {
    this.loadTemporadas();
  }

  loadTemporadas(): void {
    this.http.get<any>('http://localhost:4001/api/temporadas').subscribe({
      next: (response) => {
        this.temporadas = response?.data || [];
        this.totalPaginas = Math.ceil(this.temporadas.length / this.itemsPorPagina);
      },
      error: (error) => {
        console.error('Error al cargar temporadas:', error);
      }
    });
  }

  get temporadasPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.temporadas.slice(inicio, fin);
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || '';
  }

  getColorClass(temporadaId: number): string {
    return this.coloresTemporadas[temporadaId] || 'bg-gray-100 border-gray-300';
  }
}
