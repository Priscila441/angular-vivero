import { Component, OnInit } from '@angular/core';
import { ConsultaService } from '../../../../core/service/consulta.service';
import { ContactoService } from '../../../../core/service/contacto.service';
import { Contacto } from '../../../../core/models/contacto.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.html',
})
export class Contact implements OnInit {
  mensaje = '';
  nombre = '';
  mostrarModal = false;

  contacto?: Contacto | null;
  whatsappLimpio = ''; // para armar el link
  telefonoLimpio = '';

  constructor(
    public consultaService: ConsultaService,
    private contactoService: ContactoService
  ) {}

  ngOnInit() {
    // 1) Cargar datos de contacto del backend
    this.contactoService.obtenerContacto(1).subscribe({
      next: (data) => {
        this.contacto = data;

        // limpiar numeros (sacar espacios, +, -)
        this.whatsappLimpio = data.whatsapp.replace(/\D/g, '');
        this.telefonoLimpio = data.telefono.replace(/\D/g, '');
      },
      error: (err) => console.error('Error al obtener contacto', err),
    });

    // 2) Cargar consultas almacenadas
    const productos = this.consultaService.obtenerConsultas();
    const servicios = this.consultaService.obtenerConsultasServicios();

    if (productos.length > 0 || servicios.length > 0) {
      let partesMensaje: string[] = [];

      if (productos.length > 0) {
        partesMensaje.push(
          `Hola Alejandro, me gustaría consultar sobre los siguientes productos:\n- ${productos.join('\n- ')}`
        );
      }

      if (servicios.length > 0) {
        partesMensaje.push(
          `Además, me gustaría consultar sobre los siguientes servicios:\n- ${servicios.join('\n- ')}`
        );
      }

      this.mensaje = partesMensaje.join('\n\n');
    }
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
}
