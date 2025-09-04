import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

interface InfoCard {
  title: string;
  description: string;
  buttonText: string;
  color: string;
}


@Component({
  selector: 'app-initial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './initial.html',
  styles: [
    `.animate-fade-in {
        animation: fadeIn 0.8s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .bg-gradient-custom {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      }`]
})
export class Initial implements OnInit, OnDestroy {
cardData: InfoCard[] = [
    {
      title: "Plantas de Temporada",
      description: "Descubre nuestra selección de plantas ideales para esta estación. Perfectas para dar color a tu jardín.",
      buttonText: "Ver plantas",
      color: "green"
    },
    {
      title: "Ofertas Especiales",
      description: "Aprovecha nuestros descuentos en herramientas de jardinería. Hasta 40% de descuento en seleccionados.",
      buttonText: "Ver ofertas",
      color: "amber"
    },
    {
      title: "Asesoramiento Expertos",
      description: "Nuestros especialistas te ayudarán a elegir las mejores plantas para tu espacio y clima.",
      buttonText: "Solicitar asesoría",
      color: "blue"
    },
    {
      title: "Envíos a Domicilio",
      description: "Ahora hacemos envíos a toda la zona. Recibe tus plantas en perfectas condiciones.",
      buttonText: "Más información",
      color: "purple"
    }
  ];

  getColorClass(color: string): string {
    switch(color) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'amber':
        return 'bg-amber-100 text-amber-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  currentCardIndex: number = 0;
  private autoAdvanceInterval: any;

  ngOnInit(): void {
    this.startAutoAdvance();
  }

  ngOnDestroy(): void {
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
    }
  }

  startAutoAdvance(): void {
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

  selectCard(index: number): void {
    this.currentCardIndex = index;
  }
}
