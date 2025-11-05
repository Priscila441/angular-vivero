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

  constructor(private consultaService: ConsultaService) {}

  ngOnInit() {
    const productos = this.consultaService.obtenerConsultas();
    if (productos.length > 0) {
      this.mensaje = `Hola Alejandro, me gustaría consultar sobre los siguientes productos:\n- ${productos.join('\n- ')}`;
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

    // Nombre del usuario
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

    // Redirigir al chat de WhatsApp
    window.open(url, '_blank');
  }
}
