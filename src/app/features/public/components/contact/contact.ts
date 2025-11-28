import { Component, OnInit } from '@angular/core';
import { ConsultaService } from '../../../../core/service/consulta.service';
import { ContactoService } from '../../../../core/service/contacto.service';
import { Contacto } from '../../../../core/models/contacto.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/service/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.html',
})
export class Contact implements OnInit {
  mensaje = '';
  nombre = '';
  mostrarModal = false;
  mostrarModalResultado = false;
  modalMensaje = '';
  

  contacto?: Contacto | null;
  whatsappLimpio = ''; // para armar el link
  telefonoLimpio = '';

  editando = false;
  formContacto: Partial<Contacto> = {};

  constructor(
    public consultaService: ConsultaService,
    private contactoService: ContactoService, 
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarDatosContacto();
    this.armarMensajeInicial();
  }

  armarMensajeInicial() {
  const productos = this.consultaService.obtenerConsultas();
  const servicios = this.consultaService.obtenerConsultasServicios();

  if (productos.length > 0 || servicios.length > 0) {
    let partesMensaje: string[] = [];

    // Si hay productos → mensaje normal
    if (productos.length > 0) {
      partesMensaje.push(
        `Hola, me gustaría consultar sobre los siguientes productos:\n- ${productos.join('\n- ')}`
      );
    }

    // Si hay servicios → título depende de si ya había productos antes
    if (servicios.length > 0) {
      const tituloServicios = productos.length > 0
        ? `Además, me gustaría consultar sobre los siguientes servicios:`
        : `Hola, me gustaría consultar sobre los siguientes servicios:`;

      partesMensaje.push(
        `${tituloServicios}\n- ${servicios.join('\n- ')}`
      );
    }

    this.mensaje = partesMensaje.join('\n\n');
  }
}


  cargarDatosContacto() {
  this.contactoService.obtenerContacto(1).subscribe({
    next: (data) => {
      this.contacto = data;

      // regenerar números limpios
      this.whatsappLimpio = data.whatsapp.replace(/\D/g, '');
      this.telefonoLimpio = data.telefono.replace(/\D/g, '');
    },
    error: (err) => console.error('Error al obtener contacto', err),
  });
}


  onEnviarFormulario(event: Event) {
    event.preventDefault();
    this.mostrarModal = true;
  }

  cancelarEnvio() {
    this.mostrarModal = false;
  }

  confirmarEnvioWhatsApp() {
    const telefono = this.whatsappLimpio; // <-- ahora es dinámico

    const texto =
      this.nombre.trim() !== ''
        ? `${this.mensaje}\n\nSoy ${this.nombre}.`
        : this.mensaje;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;

    this.consultaService.limpiarConsultas();
    this.nombre = '';
    this.mensaje = '';
    this.mostrarModal = false;

    window.open(url, '_blank');
  }

  borrarConsultas() {
    this.consultaService.limpiarConsultas();
    this.mensaje = '';
  }

  abrirEdicion() { 
  if (!this.contacto) return;

  this.editando = true;

  // Copia inicial para editar
  this.formContacto = {
    email: this.contacto.email,
    telefono: this.contacto.telefono,
    whatsapp: this.contacto.whatsapp,
    horario_atencion: this.contacto.horario_atencion
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

// Guarda SOLO los valores modificados
guardarCambios() {
  if (!this.contacto) return;

  const cambios: Partial<Contacto> = {};

  if (this.formContacto.horario_atencion !== this.contacto.horario_atencion) {
    cambios.horario_atencion = this.formContacto.horario_atencion;
  }

  if (this.formContacto.email !== this.contacto.email) {
    cambios.email = this.formContacto.email;
  }

  if (this.formContacto.telefono !== this.contacto.telefono) {
    cambios.telefono = this.formContacto.telefono;
  }

  if (this.formContacto.whatsapp !== this.contacto.whatsapp) {
    cambios.whatsapp = this.formContacto.whatsapp;
  }

  if (Object.keys(cambios).length === 0) {
    this.editando = false;
    return;
  }

  this.contactoService.actualizarContacto(this.contacto.id!, cambios).subscribe({
    next: (resp) => {

      // Mostrar modal éxito
      this.mostrarResultado("Los cambios fueron realizados con éxito.");

      // 🔥 RECARGAR DESDE EL BACKEND
      this.cargarDatosContacto();

      this.editando = false;
      this.formContacto = {};
    },

    error: (err) => {
      console.error('Error al actualizar contacto', err);

      let mensaje = "No se pudieron guardar los cambios.";
      if (err.status === 400) mensaje = "Hay errores en los datos ingresados.Los valores no pueden estar vacíos.";
      if (err.status === 403) mensaje = "No tenés permiso para editar.";
      if (err.status === 500) mensaje = "Error interno del servidor.";

      this.mostrarResultado(mensaje);
    }
  });
}



}
