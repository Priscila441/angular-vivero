import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { RouterLink } from '@angular/router';
import { Categoria_servicio } from '../../../../core/models/categoria_servicio.model';
import { CategoriaServicioService } from '../../../../core/service/categoria_servicio.service';
import { ConsultaService } from '../../../../core/service/consulta.service';
import { AuthService } from '../../../../core/service/auth/auth.service';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';

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
  showUserDropdown = false;

  constructor(private categoria: CategoriaProductoService, private categoriaService: CategoriaServicioService, public consultaService: ConsultaService, public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.categoria.getAll().subscribe({
      next: res => this.categorias = res,
      error: () => this.categorias = []
    });

    this.categoriaService.getAll().subscribe({
      next: res => this.categorias_servicio = res,
      error: () => this.categorias_servicio = []
    });
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

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  irAlPanelAdmin() {
    this.router.navigate(['/admin']);
    this.showUserDropdown = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showUserDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Si el click no fue dentro del dropdown ni del botón
    if (!target.closest('.dropdown') && !target.closest('.dropdown-button')) {
      this.showUserDropdown = false;
    }
  }
}


