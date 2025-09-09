import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html'
})
export class Navbar {
  showMenu = false;
  showProductDropdown = false;
  showServiceDropdown = false;

  toggleMenu() {
    this.showMenu = !this.showMenu;

    this.showProductDropdown = false;
    this.showServiceDropdown = false;
  }

  toggleProductDropdown() {
    this.showProductDropdown = !this.showProductDropdown;
    this.showServiceDropdown = false;
  }

  toggleServiceDropdown() {
    this.showServiceDropdown = !this.showServiceDropdown;
    this.showProductDropdown = false;
  }

  closeDropdown() {
    this.showProductDropdown = false;
    this.showServiceDropdown = false;
  }
}


