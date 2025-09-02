import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  showProductDropdown = false;
  showServiceDropdown = false;

  toggleProductDropdown() {
    this.showProductDropdown = !this.showProductDropdown;
  }

  toggleServiceDropdown() {
    this.showServiceDropdown = !this.showServiceDropdown;
  }

  closeDropdown() {
    this.showProductDropdown = false;
    this.showServiceDropdown = false;
  }

}


