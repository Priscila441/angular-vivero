import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsImagesComponent } from '../products-images/products-images.component';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule, ProductsImagesComponent],
  templateUrl: './images.component.html'
})
export class ImagesComponent {
  selectedTab: 'productos' | 'servicios' = 'productos';

  selectTab(tab: 'productos' | 'servicios') {
    this.selectedTab = tab;
  }
}
