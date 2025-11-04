import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
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
  email = '';

  constructor(private consultaService: ConsultaService) {}

  ngOnInit() {
    const productos = this.consultaService.obtenerConsultas();
    if (productos.length > 0) {
      this.mensaje = `Hola, me gustaría consultar sobre los siguientes productos:\n- ${productos.join('\n- ')}`;
    }
  }

  onEnviarFormulario() {
  // logica de envío de form

  this.consultaService.limpiarConsultas();
  this.nombre = '';
  this.email = '';
  this.mensaje = '';
  alert('Tu consulta fue enviada correctamente.');
}

}
