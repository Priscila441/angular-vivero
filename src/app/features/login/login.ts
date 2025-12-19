import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'login.html',
  styles: [`@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
`]

})
export class Login {
  email = '';
  password = '';
  loading = false;
  showModal = false;
  modalMessage = '';
  modalSuccess = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.showMessage('Todos los campos son obligatorios', false);
      return;
    }

    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.showMessage('Inicio de sesión exitoso', true);
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 1500);
      },
      error: () => {
        this.showMessage('Credenciales inválidas', false);
        this.loading = false;
      }
    });
  }

  showMessage(message: string, success: boolean) {
    this.modalMessage = message;
    this.modalSuccess = success;
    this.showModal = true;
    setTimeout(() => (this.showModal = false), 3000);
  }

  volverHome() {
    this.router.navigate(['/']);
  }
}
