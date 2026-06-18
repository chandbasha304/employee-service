import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { strongPasswordValidator } from '../../../core/validators/strong-password.validator';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    this.initializeForm();
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { signupSuccess?: string };
    if (state?.signupSuccess) {
      this.toastService.success(state.signupSuccess);
    }
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100),
        Validators.pattern(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        )
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        strongPasswordValidator
      ]]
    });
  }

  onSubmit(): void {
    if (this.loading) return;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    console.time('TOTAL_LOGIN_FLOW');

    this.authService.login(this.loginForm.value).pipe(
      finalize(() => {
        this.loading = false;
        console.timeEnd('TOTAL_LOGIN_FLOW');
      })
    ).subscribe({
      next: (response) => {
        this.toastService.success('Login Successful');
        // AuthService.login() handles redirection
      },
      error: (err) => {
        console.timeLog('TOTAL_LOGIN_FLOW', 'Error callback started');

        const backendMessage = typeof err.error === 'string'
          ? err.error
          : err.error?.message || 'Invalid email or password';

        this.toastService.error(backendMessage);
        this.ngZone.run(() => this.cdr.detectChanges());
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}