import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsImagesComponent } from '../products-images/products-images.component';
import { ServicesImagesComponent } from '../services-images/services-images.component';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule, ProductsImagesComponent, ServicesImagesComponent],
  templateUrl: './images.component.html'
})
export class ImagesComponent {
  selectedTab: 'productos' | 'servicios' = 'productos';

  selectTab(tab: 'productos' | 'servicios'): void {
    this.selectedTab = tab;
  }
}
