import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [],
  template: `
  <div class="py-20 bg-gradient-to-br from-green-50 to-green-100">
    <div class="max-w-6xl mx-auto m-6 px-4 text-center rounded-md bg-white shadow-lg p-6">
      
      <!-- Título -->
      <h2 class="text-3xl md:text-4xl font-bold text-green-800 mb-4">
        Preguntas Frecuentes
      </h2>
      <p class="text-gray-600 mb-12">
        Resolvemos tus dudas más comunes para acompañarte mejor 🌱
      </p>

      <!-- Accordion de Flowbite -->
      <div id="accordion-collapse" data-accordion="collapse" class="text-left">
        
        <!-- FAQ 1 -->
        <h2 id="accordion-collapse-heading-1">
          <button type="button" 
            class="flex items-center justify-between w-full p-5 font-medium text-green-800 border border-b-0 border-green-200 rounded-t-xl focus:ring-4 focus:ring-green-200 hover:bg-green-100 gap-3" 
            data-accordion-target="#accordion-collapse-body-1" 
            aria-expanded="true" 
            aria-controls="accordion-collapse-body-1">
            <span>¿Hacen envíos a domicilio?</span>
            <svg data-accordion-icon class="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
            </svg>
          </button>
        </h2>
        <div id="accordion-collapse-body-1" class="hidden" aria-labelledby="accordion-collapse-heading-1">
          <div class="p-5 border border-b-0 border-green-200 bg-white rounded-b-lg shadow">
            <p class="mb-2 text-gray-600">
              Sí 🌿. Realizamos envíos a domicilio dentro del pueblo y zonas cercanas.
            </p>
            <p class="text-gray-600">
              También podés retirar tu pedido directamente en nuestro vivero.
            </p>
          </div>
        </div>

        <!-- FAQ 2 -->
        <h2 id="accordion-collapse-heading-2">
          <button type="button" 
            class="flex items-center justify-between w-full p-5 font-medium text-green-800 border border-b-0 border-green-200 focus:ring-4 focus:ring-green-200 hover:bg-green-100 gap-3" 
            data-accordion-target="#accordion-collapse-body-2" 
            aria-expanded="false" 
            aria-controls="accordion-collapse-body-2">
            <span>¿De qué forma se entregan las plantas?</span>
            <svg data-accordion-icon class="w-3 h-3 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
            </svg>
          </button>
        </h2>
        <div id="accordion-collapse-body-2" class="hidden" aria-labelledby="accordion-collapse-heading-2">
          <div class="p-5 border border-b-0 border-green-200 bg-white rounded-b-lg shadow">
            <p class="mb-2 text-gray-600">
              Nuestras plantas se entregan en macetas resistentes, listas para ser transplantadas o colocadas en el lugar que elijas.
            </p>
            <p class="text-gray-600">
              También podés solicitar que se preparen para trasplante directo a tierra.
            </p>
          </div>
        </div>

        <!-- FAQ 3 -->
        <h2 id="accordion-collapse-heading-3">
          <button type="button" 
            class="flex items-center justify-between w-full p-5 font-medium text-green-800 border border-green-200 focus:ring-4 focus:ring-green-200 hover:bg-green-100 gap-3" 
            data-accordion-target="#accordion-collapse-body-3" 
            aria-expanded="false" 
            aria-controls="accordion-collapse-body-3">
            <span>¿Cómo cuido una planta recién comprada?</span>
            <svg data-accordion-icon class="w-3 h-3 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
            </svg>
          </button>
        </h2>
        <div id="accordion-collapse-body-3" class="hidden" aria-labelledby="accordion-collapse-heading-3">
          <div class="p-5 border border-t-0 border-green-200 bg-white rounded-b-lg shadow">
            <p class="mb-2 text-gray-600">
              Te recomendamos colocarla en un lugar con buena luz natural, regarla de forma moderada y evitar cambios bruscos de temperatura.
            </p>
            <p class="text-gray-600">
              Además, cada planta incluye una pequeña guía de cuidados para que crezca fuerte y sana 🌿.
            </p>
          </div>
        </div>


        <!-- FAQ 4 -->
        <h2 id="accordion-collapse-heading-4">
          <button type="button" 
            class="flex items-center justify-between w-full p-5 font-medium text-green-800 border border-green-200 focus:ring-4 focus:ring-green-200 hover:bg-green-100 gap-3" 
            data-accordion-target="#accordion-collapse-body-4" 
            aria-expanded="false" 
            aria-controls="accordion-collapse-body-4">
            <span>¿Cómo cuido una planta recién comprada?</span>
            <svg data-accordion-icon class="w-3 h-3 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
            </svg>
          </button>
        </h2>
        <div id="accordion-collapse-body-4" class="hidden" aria-labelledby="accordion-collapse-heading-4">
          <div class="p-5 border border-t-0 border-green-200 bg-white rounded-b-lg shadow">
            <p class="mb-2 text-gray-600">
              Te recomendamos colocarla en un lugar con buena luz natural, regarla de forma moderada y evitar cambios bruscos de temperatura.
            </p>
            <p class="text-gray-600">
              Además, cada planta incluye una pequeña guía de cuidados para que crezca fuerte y sana 🌿.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class FAQ {}
