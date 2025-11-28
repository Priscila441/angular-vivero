import { Component } from '@angular/core';
import { SobreNosotrosService } from '../../../../core/service/sobre_nosotros.service';
import { AuthService } from '../../../../core/service/auth/auth.service';
import { SobreNosotros } from '../../../../core/models/sobre_nosotros.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Encargados } from './encargados/encargados';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [FormsModule, CommonModule, Encargados],
  templateUrl: './about-us.html',
})
export class AboutUs {
  sobreNosotros?: SobreNosotros | null;
  cargando = false;

  editando = false;
  formSobreNosotros: Partial<SobreNosotros> = {};
  

  // modales
  mostrarModalResultado = false;
  modalMensaje = '';

  constructor(
    private sobreNosotrosService: SobreNosotrosService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.sobreNosotrosService.getSobreNosotros(1).subscribe({
      next: (data) => {
        this.sobreNosotros = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  abrirEdicion() {
    if (!this.sobreNosotros) return;

    this.editando = true;

    // Cargar copia editable
    this.formSobreNosotros = {
      nuestro_origen: this.sobreNosotros.nuestro_origen,
      produccion_historica: this.sobreNosotros.produccion_historica,
      nuevas_producciones: this.sobreNosotros.nuevas_producciones,
      imagen_url: this.sobreNosotros.imagen_url,
      imagen2_url: this.sobreNosotros.imagen2_url,
      imagen3_url: this.sobreNosotros.imagen3_url,
      imagen4_url: this.sobreNosotros.imagen4_url,
      imagen5_url: this.sobreNosotros.imagen5_url
    };
  }

  cerrarEdicion() {
    this.editando = false;
  }

  private mostrarResultado(mensaje: string) {
    this.modalMensaje = mensaje;
    this.mostrarModalResultado = true;
  }

  cerrarModalResultado() {
    this.mostrarModalResultado = false;
  }

  // GUARDAR SOLO CAMBIOS
  guardarCambios() {
    if (!this.sobreNosotros) return;

    const cambios: Partial<SobreNosotros> = {};

    const campos: (keyof SobreNosotros)[] = [
      'nuestro_origen',
      'produccion_historica',
      'nuevas_producciones',
      'imagen_url',
      'imagen2_url',
      'imagen3_url',
      'imagen4_url',
      'imagen5_url'
    ];

    for (const campo of campos) {
  const valor = this.formSobreNosotros[campo];
  const valorOriginal = this.sobreNosotros[campo];

  // Si no cambió, no lo agregamos
  if (valor === valorOriginal) continue;

  // Validación: no permitir campos vacíos
  if (typeof valor === "string" && valor.trim() === "") {
    this.mostrarResultado("Ningún campo puede quedar vacío.");
    return;
  }

  // Si pasa la validación, agregamos el cambio
  cambios[campo] = valor as any;
}


    if (Object.keys(cambios).length === 0) {
      this.editando = false;
      return;
    }

    this.sobreNosotrosService.updateSobreNosotros(1, cambios).subscribe({
      next: (resp) => {
        this.sobreNosotros = { ...this.sobreNosotros!, ...resp };
        this.editando = false;

        this.mostrarResultado("Los cambios fueron realizados con éxito.");
        this.formSobreNosotros = {};
      },

      error: (err) => {
        let mensaje = "No se pudieron guardar los cambios.";
        if (err.status === 400) mensaje = "Hay errores en los datos. Los campos no pueden estar vacíos.";
        if (err.status === 403) mensaje = "No tenés permiso para editar.";
        if (err.status === 500) mensaje = "Error interno del servidor.";

        this.mostrarResultado(mensaje);
      }
    });
  }
}
