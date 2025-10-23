import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'faq.html'
})
export class FAQ {
  faqs = [
    {
      pregunta: '¿Hacen envíos a domicilio?',
      respuesta: 'Sí 🌿. Realizamos envíos a domicilio dentro del pueblo y zonas cercanas. También podés retirar tu pedido directamente en nuestro vivero.'
    },
    {
      pregunta: '¿De qué forma se entregan las plantas?',
      respuesta: 'Nuestras plantas se entregan en macetas resistentes, listas para ser transplantadas o colocadas en el lugar que elijas. También podés solicitar que se preparen para trasplante directo a tierra.'
    },
    {
      pregunta: '¿Cómo cuido una planta recién comprada?',
      respuesta: 'Te recomendamos colocarla en un lugar con buena luz natural, regarla de forma moderada y evitar cambios bruscos de temperatura. Además, cada planta incluye una pequeña guía de cuidados para que crezca fuerte y sana 🌿.'
    }
  ];

  openIndex: number | null = null;

  toggle(index: number) {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
