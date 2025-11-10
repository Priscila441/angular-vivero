import { Component, OnInit } from '@angular/core';
import { ConsultaService } from '../../../../core/service/consulta.service';
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

  constructor(public consultaService: ConsultaService) {}

  ngOnInit() {
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
    const telefono = '5493515457821'; // número de WhatsApp de Alejandro

    const texto =
      this.nombre.trim() !== ''
        ? `${this.mensaje}\n\nSoy ${this.nombre}.`
        : this.mensaje;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;

    // Limpiar formulario y consultas
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
