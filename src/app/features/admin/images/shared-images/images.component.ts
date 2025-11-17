import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardsImagesComponent } from './cards-images/cards-images.component';
import { ServicesImagesComponent } from '../services-images/services-images.component';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule, CardsImagesComponent],
  templateUrl: './images.component.html',
  styleUrls: []
})
export class ImagesComponent {
  selectedTab: string = 'productos';
  servicesComp = ServicesImagesComponent;

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
}
