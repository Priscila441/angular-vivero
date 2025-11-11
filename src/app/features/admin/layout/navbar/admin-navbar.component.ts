import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/service/auth/auth.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [],
  templateUrl: './admin-navbar.component.html',
  styleUrls: []
})
export class AdminNavbarComponent {
  showUserDropdown = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleUserDropdown() {
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

    // Si el click no fue dentro del dropdown ni del botón
    if (!target.closest('.dropdown') && !target.closest('.dropdown-button')) {
      this.showUserDropdown = false;
    }
  }
}
