import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AdminNavbarComponent } from './navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SidebarComponent, AdminNavbarComponent],
  template: `
  <div class="flex h-screen bg-gray-50">
      <!-- Sidebar fijo -->
      <app-sidebar></app-sidebar>
      <!-- Área principal -->
      <div class="flex flex-col flex-1 h-full">
        <!-- Navbar fijo solo en el área principal -->
        <app-admin-navbar></app-admin-navbar>
  <main class="flex-1 overflow-y-auto bg-[#F6FBF8]">
          <ng-content select="[admin-header]"></ng-content>
          <!-- Contenido de las páginas -->
          <div class="p-6 pt-0">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
}
