import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html'
})
export class Navbar {
  showProductDropdown = false;
  showServiceDropdown = false;
  showMenu = false; 

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

  toggleMenu() {
    this.showMenu = !this.showMenu; // 👈 Abre/cierra el menú en móviles
  }
}


