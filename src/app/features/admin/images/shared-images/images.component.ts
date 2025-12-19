import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardsImagesComponent } from './cards-images/cards-images.component';
import { ServicesImagesComponent } from '../services-images/services-images.component';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule, RouterModule, CardsImagesComponent, ServicesImagesComponent],
  templateUrl: './images.component.html',
  styleUrls: []
})
export class ImagesComponent {
  selectedTab: string = 'productos';

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
}
