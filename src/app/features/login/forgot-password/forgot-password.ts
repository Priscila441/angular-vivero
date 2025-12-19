import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/service/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  loading = false;
  message = '';
  

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(private authService: AuthService) {}

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.message = '';

    this.authService.forgotPassword(this.form.value.email!)
      .subscribe({
        next: (res) => {
          this.message = res.message;
          this.loading = false;
        },
        error: () => {
          // mismo mensaje por seguridad
          this.message = 'Si el correo existe, se ha enviado un email.';
          this.loading = false;
        }
      });
  }
}
