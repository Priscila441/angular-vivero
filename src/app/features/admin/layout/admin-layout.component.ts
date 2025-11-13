import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AdminNavbarComponent } from './navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SidebarComponent, AdminNavbarComponent],
  template: `
  <div class="flex h-screen bg-gray-50 relative">
      <!-- Overlay para móviles -->
      <div 
        *ngIf="isSidebarOpen && isMobile" 
        class="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
        (click)="closeSidebar()"
      ></div>
      
      <!-- Sidebar -->
      <app-sidebar 
        [isOpen]="isSidebarOpen" 
        [isMobile]="isMobile"
        (closeSidebar)="closeSidebar()"
      ></app-sidebar>
      
      <!-- Área principal -->
      <div class="flex flex-col flex-1 h-full w-full lg:w-auto">
        <!-- Navbar -->
        <app-admin-navbar 
          [isMobile]="isMobile"
          (toggleSidebar)="toggleSidebar()"
        ></app-admin-navbar>
        <main class="flex-1 overflow-y-auto overflow-x-hidden bg-[#F6FBF8]">
          <ng-content select="[admin-header]"></ng-content>
          <!-- Contenido de las páginas -->
          <div class="p-4 pt-0">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;
  isMobile = false;
  private resizeListener?: () => void;

  ngOnInit(): void {
    this.checkMobile();
    this.resizeListener = () => this.checkMobile();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}
