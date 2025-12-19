import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TemporadaService } from '../../../core/service/temporada.service';
import { Temporada } from '../../../core/models/temporada.model';

@Component({
  selector: 'app-seasons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seasons.component.html',
  styleUrls: []
})
export class SeasonsComponent implements OnInit {
  temporadas: any[] = [];
  
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  // Mapa para almacenar colores asignados a cada temporada por ID
  private coloresAsignados: Map<number, string> = new Map();

  // Paleta de colores disponibles
  private readonly coloresDisponibles = [
    'bg-orange-100 text-orange-800',
    'bg-yellow-100 text-yellow-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-rose-100 text-rose-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-cyan-100 text-cyan-800',
    'bg-teal-100 text-teal-800'
  ];

  isModalOpen = false;
  nuevaTemporada = {
    nombre: '',
    fecha_desde: null as number | null,
    fecha_hasta: null as number | null
  };

  // Variables para modal de borrar
  modalBorrar = false;
  temporadaABorrar: any = null;
  mensaje: string = '';
  mostrarMensajeExito = false;

  // Variable para modal de éxito al crear
  showSuccessModal = false;
  successMessage = '';

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
        
        // Asignar colores aleatorios a temporadas que no tienen color asignado
        this.temporadas.forEach(temporada => {
          if (!this.coloresAsignados.has(temporada.id)) {
            const colorAleatorio = this.coloresDisponibles[Math.floor(Math.random() * this.coloresDisponibles.length)];
            this.coloresAsignados.set(temporada.id, colorAleatorio);
          }
        });
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

  getColorClass(temporada: any): string {
    // 1. Prioridad: usar el mapeo hardcodeado por ID si existe
    if (this.coloresTemporadas[temporada.id]) {
      return this.coloresTemporadas[temporada.id];
    }

    // 2. Si ya tiene color asignado en el mapa, usarlo
    if (this.coloresAsignados.has(temporada.id)) {
      return this.coloresAsignados.get(temporada.id) || 'bg-gray-100 text-gray-800';
    }

    // 3. Buscar si hay otra temporada con el mismo nombre y usar su color
    const temporadaMismoNombre = this.temporadas.find(t => 
      t.nombre.toLowerCase().trim() === temporada.nombre.toLowerCase().trim() && 
      t.id !== temporada.id &&
      this.coloresAsignados.has(t.id)
    );
    
    if (temporadaMismoNombre) {
      const colorExistente = this.coloresAsignados.get(temporadaMismoNombre.id)!;
      this.coloresAsignados.set(temporada.id, colorExistente);
      return colorExistente;
    }


    const colorAleatorio = this.coloresDisponibles[Math.floor(Math.random() * this.coloresDisponibles.length)];
    this.coloresAsignados.set(temporada.id, colorAleatorio);
    return colorAleatorio;
  }

  openModal(): void {
    console.log('openModal llamado');
    this.isModalOpen = true;
    console.log('isModalOpen:', this.isModalOpen);
  }

  closeModal(): void {
    this.isModalOpen = false;
    // Limpiar el formulario al cerrar
    this.nuevaTemporada = {
      nombre: '',
      fecha_desde: null,
      fecha_hasta: null
    };
  }

  guardarTemporada(): void {
    if (!this.nuevaTemporada.nombre || !this.nuevaTemporada.fecha_desde || !this.nuevaTemporada.fecha_hasta) {
      console.error('Todos los campos son requeridos');
      return;
    }

    const temporadaData = {
      nombre: this.nuevaTemporada.nombre,
      fecha_desde: this.nuevaTemporada.fecha_desde,  // Enviar solo el número del mes
      fecha_hasta: this.nuevaTemporada.fecha_hasta   // Enviar solo el número del mes
    };

    console.log('Enviando temporada:', temporadaData);

    // Enviar directamente el objeto sin tipado de Temporada
    this.http.post<any>('http://localhost:4001/api/temporadas', temporadaData).subscribe({
      next: (response) => {
        console.log('Temporada creada exitosamente:', response);
        this.loadTemporadas(); // Recargar la lista
        this.closeModal();
        this.mostrarModalExito(`La temporada "${temporadaData.nombre}" ha sido agregada exitosamente.`);
      },
      error: (error) => {
        console.error('Error al crear temporada:', error);
        console.error('Detalles del error:', error.error);
        if (error.error?.errors) {
          console.error('Errores de validación:', error.error.errors);
          error.error.errors.forEach((err: any, index: number) => {
            console.error(`Error ${index + 1}:`, err);
          });
        }
      }
    });
  }

  // Funcionalidad de borrar temporada
  borrarTemporada(temporada: any): void {
    this.temporadaABorrar = temporada;
    this.modalBorrar = true;
  }

  cancelarBorrado(): void {
    this.modalBorrar = false;
    this.temporadaABorrar = null;
  }

  confirmarBorrado(): void {
    if (!this.temporadaABorrar) return;
    
    const nombreTemporada = this.temporadaABorrar.nombre;
    const idTemporada = this.temporadaABorrar.id;
    
    this.http.delete(`http://localhost:4001/api/temporadas/${idTemporada}`).subscribe({
      next: () => {
        this.temporadas = this.temporadas.filter(t => t.id !== idTemporada);
        this.totalPaginas = Math.ceil(this.temporadas.length / this.itemsPorPagina);
        this.cerrarModalBorrar();
        this.mostrarMensajeTemporada(`La temporada "${nombreTemporada}" ha sido eliminada exitosamente.`, false);
      },
      error: (error) => {
        console.error('Error al eliminar temporada:', error);
        this.cerrarModalBorrar();
        this.mostrarMensajeTemporada('Error al eliminar la temporada. Por favor, intenta nuevamente.', true);
      }
    });
  }

  private cerrarModalBorrar(): void {
    this.modalBorrar = false;
    this.temporadaABorrar = null;
  }

  private mostrarMensajeTemporada(mensaje: string, esError: boolean = false): void {
    this.mensaje = mensaje;
    this.mostrarMensajeExito = true;
    
    setTimeout(() => {
      this.mostrarMensajeExito = false;
      this.mensaje = '';
    }, 3000);
  }

  private mostrarModalExito(mensaje: string): void {
    this.successMessage = mensaje;
    this.showSuccessModal = true;
    
    setTimeout(() => {
      this.showSuccessModal = false;
      this.successMessage = '';
    }, 3500);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successMessage = '';
  }
}
