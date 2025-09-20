import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar fijo -->
      <app-sidebar></app-sidebar>
      <!-- Contenido principal -->
      <main class="flex-1 overflow-y-auto bg-[#e8f2ec]">
        <ng-content select="[admin-header]"></ng-content>
        <!-- Contenido de las páginas -->
        <div class="p-6 pt-0">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
}
