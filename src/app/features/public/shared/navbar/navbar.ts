import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { RouterLink } from '@angular/router';
import { Categoria_servicio } from '../../../../core/models/categoria_servicio.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html'
})
export class Navbar {
  showMenu = false;
  showProductDropdown = false;
  showServiceDropdown = false;
  categorias: Categoria_producto[] = [];
  categorias_servicio: Categoria_servicio[] = [];

  constructor(private categoriaService: CategoriaProductoService) {}

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe({
      next: res => this.categorias = res,
      error: () => this.categorias = []
    });

    this.categoriaService.getAll().subscribe({
      next: res => this.categorias_servicio = res,
      error: () => this.categorias_servicio = []
    })
  }

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


