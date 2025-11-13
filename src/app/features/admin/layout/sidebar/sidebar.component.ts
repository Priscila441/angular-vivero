import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() isOpen: boolean = false;
  @Input() isMobile: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();

  onCloseSidebar(): void {
    if (this.isMobile) {
      this.closeSidebar.emit();
    }
  }
}
