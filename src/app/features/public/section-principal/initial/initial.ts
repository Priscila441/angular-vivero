import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";

interface InfoCard {
  title: string;
  description: string;
  buttonText: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-initial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './initial.html',
  styles: [
    `
    /* Fade-in card text */
    .animate-fade-in {
      animation: fadeIn 0.8s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Overlay sutil sobre las imágenes */
    .bg-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.25);
      z-index: 1;
    }

    /* Fondo dinámico del componente */
    .bg-slideshow {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      animation: slideshow 12s infinite;
      z-index: 0;
    }

    @keyframes slideshow {
      0%, 33% {
        background-image: url('/Presentation.jpeg');
      }
      34%, 66% {
        background-image: url('/viveroSol.jpeg');
      }
      67%, 100% {
        background-image: url('/about-us/viveroEntrada.jpeg');
      }
    }

    /* Glass card */
    .glass-card {
      background: rgba(255,255,255,0.28);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.18);
    }

    /* Logo con más contraste */
    .logo-box {
      background: rgba(255,255,255,0.72);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border-radius: 1rem;
    }

    /* Responsivo */
    @media (min-width: 768px) {
      .initial-card {
        margin-top: 90px;
      }
    }
    `
  ]
})
export class Initial {

  cardData: InfoCard[] = [
    {
      title: "Maquinaria y Herramientas",
      description: "Contamos con equipamiento especializado para facilitar el trabajo en tú vivero. ¡Consulta nuestras opciones de alquiler por hora!",
      buttonText: "Ver más",
      route: "/servicio/1",
      color: "green"
    },
    {
      title: "Amplia Superficie",
      description: "Nuestro vivero se extiende sobre 13 hectáreas, ofreciendo el espacio ideal para la producción de plantas y árboles de todo tipo.",
      buttonText: "Explorar vivero",
      route: "/sobre-nosotros",
      color: "purple"
    },
    {
      title: "Variedad de Productos",
      description: "Desde frutas de estación hasta árboles autóctonos y ornamentales, tenemos todo lo que tu jardín o emprendimiento necesita.",
      buttonText: "Descubrir productos",
      route: "/productos/1",
      color: "blue"
    },
    {
      title: "Historia y Tradición",
      description: "Con décadas de trayectoria, nuestro vivero combina experiencia y nuevas alternativas de producción para ofrecer lo mejor a nuestros clientes. Comunicate con nosotros!",
      buttonText: "Comunicarme con el vivero",
      route: "/contacto",
      color: "purple"
    }
  ];

  currentCardIndex = 0;
  private autoAdvanceInterval: any;

  constructor() {
    this.autoAdvanceInterval = setInterval(() => {
      this.nextCard();
    }, 6000);
  }

  nextCard(): void {
    this.currentCardIndex = (this.currentCardIndex + 1) % this.cardData.length;
  }

  prevCard(): void {
    this.currentCardIndex = (this.currentCardIndex - 1 + this.cardData.length) % this.cardData.length;
  }

  selectCard(i: number): void {
    this.currentCardIndex = i;
  }

  
}
