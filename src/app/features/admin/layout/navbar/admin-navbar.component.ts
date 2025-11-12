import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/service/auth/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  templateUrl: './admin-navbar.component.html',
})
export class AdminNavbarComponent {
  showUserDropdown = false;

  constructor(private authService: AuthService, private router: Router) {}

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.dropdown-button')) {
      this.showUserDropdown = false;
    }
  }
}
