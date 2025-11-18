import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Categoria_producto } from '../../../../core/models/categoria_producto.models';
import { Categoria_servicio } from '../../../../core/models/categoria_servicio.model';
import { CategoriaProductoService } from '../../../../core/service/categoria_producto.service';
import { CategoriaServicioService } from '../../../../core/service/categoria_servicio.service';
import { ConsultaService } from '../../../../core/service/consulta.service';
import { AuthService } from '../../../../core/service/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
})
export class Navbar {
  showMenu = false;
  showProductDropdown = false;
  showServiceDropdown = false;
  showUserDropdown = false;

  categorias: Categoria_producto[] = [];
  categorias_servicio: Categoria_servicio[] = [];

  constructor(
    private categoriaProductoService: CategoriaProductoService,
    private categoriaServicioService: CategoriaServicioService,
    public consultaService: ConsultaService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoriaProductoService.getAll().subscribe({
      next: (res) => (this.categorias = res),
      error: () => (this.categorias = []),
    });

    this.categoriaServicioService.getAll().subscribe({
      next: (res) => (this.categorias_servicio = res),
      error: () => (this.categorias_servicio = []),
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
    this.closeDropdowns();
  }

  toggleProductDropdown() {
    this.showProductDropdown = !this.showProductDropdown;
    this.showServiceDropdown = false;
  }

  toggleServiceDropdown() {
    this.showServiceDropdown = !this.showServiceDropdown;
    this.showProductDropdown = false;
  }

  toggleUserDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeDropdowns() {
    this.showProductDropdown = false;
    this.showServiceDropdown = false;
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
    if (!target.closest('.dropdown') && !target.closest('.dropdown-button')) {
      this.showUserDropdown = false;
    }
  }
}
