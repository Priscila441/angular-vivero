import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './images.component.html'
})
export class ImagesComponent {
  selectedTab: 'productos' | 'servicios' = 'productos';

  selectTab(tab: 'productos' | 'servicios') {
    this.selectedTab = tab;
  }
}
