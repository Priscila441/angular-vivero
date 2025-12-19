import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/service/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ ReactiveFormsModule],
  templateUrl: './reset-password.html'
})
export class ResetPassword {
  token: string | null = null;
  loading = false;
  error = '';
  success = '';
  

  form = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ])
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token');

    // Si no hay token → volvemos al login
    if (!this.token) {
      this.router.navigate(['/login']);
    }
  }

  submit() {
    if (this.form.invalid || !this.token) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.resetPassword(
      this.token,
      this.form.value.password!
    ).subscribe({
      next: () => {
        this.success = 'Contraseña actualizada correctamente.';
        this.loading = false;

        // Redirige al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al restablecer la contraseña.';
      }
    });
  }
}
