import { Component } from '@angular/core';
import { EncargadoService } from '../../../../../core/service/encargado.service';
import { AuthService } from '../../../../../core/service/auth/auth.service';
import { Encargado } from '../../../../../core/models/encargado.models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-encargados',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './encargados.html'
})
export class Encargados {

  encargado1?: Encargado;
  encargado2?: Encargado;

  editando = false;
  encargadoActual?: Encargado;

  formEncargado: Partial<Encargado> = {};

  mostrarModalResultado = false;
  modalMensaje = "";

  constructor(
    private encargadoService: EncargadoService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarEncargados();
  }

  cargarEncargados() {
    this.encargadoService.getEncargado(1).subscribe({
      next: (resp) => this.encargado1 = resp,
      error: (err) => console.error("Error cargando encargado 1", err)
    });

    this.encargadoService.getEncargado(2).subscribe({
      next: (resp) => this.encargado2 = resp,
      error: (err) => console.error("Error cargando encargado 2", err)
    });
  }

  abrirEdicion(encargado: Encargado) {
    this.encargadoActual = encargado;
    this.formEncargado = {
      nombre: encargado.nombre,
      descripcion: encargado.descripcion,
      foto: encargado.foto
    };
    this.editando = true;
  }

  cerrarEdicion() {
    this.editando = false;
  }

  private mostrarResultado(msg: string) {
    this.modalMensaje = msg;
    this.mostrarModalResultado = true;
  }

  cerrarModalResultado() {
    this.mostrarModalResultado = false;
  }

  guardarCambios() {
    if (!this.encargadoActual) return;

    // Validación de campos vacíos
    if (
      !this.formEncargado.nombre?.trim() ||
      !this.formEncargado.descripcion?.trim() ||
      !this.formEncargado.foto?.trim()
    ) {
      this.mostrarResultado("Todos los campos son obligatorios. No pueden quedar vacíos.");
      return;
    }

    const cambios: Partial<Encargado> = {};

    if (this.formEncargado.nombre !== this.encargadoActual.nombre)
      cambios.nombre = this.formEncargado.nombre;

    if (this.formEncargado.descripcion !== this.encargadoActual.descripcion)
      cambios.descripcion = this.formEncargado.descripcion;

    if (this.formEncargado.foto !== this.encargadoActual.foto)
      cambios.foto = this.formEncargado.foto;

    if (Object.keys(cambios).length === 0) {
      this.editando = false;
      return;
    }

    this.encargadoService.updateEncargado(this.encargadoActual.id!, cambios)
      .subscribe({
        next: () => {
          this.mostrarResultado("Los cambios se guardaron correctamente.");
          this.cargarEncargados();
          this.editando = false;
        },
        error: (err) => {
          let mensaje = "Error al actualizar encargado.";
          if (err.status === 400) mensaje = "Los valores no pueden estar vacíos.";
          if (err.status === 403) mensaje = "No tenés permiso para editar.";
          if (err.status === 500) mensaje = "Error interno en el servidor.";

          this.mostrarResultado(mensaje);
        }
      });
  }
}
