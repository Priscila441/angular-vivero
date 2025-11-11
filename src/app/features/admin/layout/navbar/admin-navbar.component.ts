import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: []
})
export class AdminNavbarComponent  {
  isOpen = false;

  @ViewChild('menuContainer', { static: true }) private menuContainer!: ElementRef<HTMLElement>;

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as Node | null;
    if (!this.menuContainer?.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  // Acciones del menú (implementación real pendiente de rutas/servicios)
  onProfile(): void {
    this.closeDropdown();
  }

  onEditProfile(): void {
    this.closeDropdown();
  }

  onLogout(): void {
    // TODO: Integrar con servicio de autenticación
    this.closeDropdown();
  }
}
