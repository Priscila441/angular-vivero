import { Component, HostListener, ElementRef, ViewChild, Input, Output,EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/service/auth/auth.service';
import { ProductoService } from '../../../../core/service/producto.service';
import { ServicioService } from '../../../../core/service/servicio.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-navbar.component.html',
})
export class AdminNavbarComponent {
  @Input() isMobile: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  showUserDropdown = false;
  searchTerm = '';
  searchResults: any[] = [];
  showSearch = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private productoService: ProductoService,
    private servicioService: ServicioService
  ) {}

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleUserDropdown(event: MouseEvent) {
    event.stopPropagation(); // Evita que el click cierre inmediatamente el dropdown
    this.showUserDropdown = !this.showUserDropdown;
  }

  irASitioPublico() {
    this.router.navigate(['/']);
    this.showUserDropdown = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showUserDropdown = false;
  }

  onSearch() {
    const q = this.searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    if (q.length < 2) { 
      this.searchResults = []; 
      this.showSearch = false; 
      return; 
    }

    this.showSearch = true;
    this.searchResults = [];
    
    forkJoin({
      productos: this.productoService.getAll(),
      servicios: this.servicioService.getAll()
    }).subscribe(({ productos, servicios }: any) => {
      const prodArray = productos?.data || [];
      const servArray = servicios?.data || [];
      
      prodArray.forEach((p: any) => {
        if (p.nombre && p.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)) {
          this.searchResults.push({ tipo: 'Productos', nombre: p.nombre, ruta: ['/admin/products/edit', p.id] });
        }
      });
      
      servArray.forEach((s: any) => {
        if (s.nombre && s.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)) {
          this.searchResults.push({ tipo: 'Servicios', nombre: s.nombre, ruta: ['/admin/services/edit', s.id] });
        }
      });
      
      this.searchResults = this.searchResults.slice(0, 10);
    });
  }

  selectResult(result: any) {
    this.router.navigate(result.ruta);
    this.searchTerm = '';
    this.searchResults = [];
    this.showSearch = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.dropdown-button')) {
      this.showUserDropdown = false;
    }
    if (!target.closest('.search-box')) {
      this.showSearch = false;
    }
  }
}
