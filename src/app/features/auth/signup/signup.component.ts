import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { strongPasswordValidator } from '../../../core/validators/strong-password.validator';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm!: FormGroup;
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
  }

  initializeForm(): void {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        strongPasswordValidator
      ]],
      countryCode: ['+91', Validators.required],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      role: ['ADMIN', Validators.required],
      status: ['active']
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const formValue = {
      ...this.signupForm.value,
      phone: `${this.signupForm.value.countryCode}${this.signupForm.value.phone}`
    };

    this.authService.signup(formValue).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        const successMessage = `User created successfully with email: ${this.signupForm.value.email}`;
        this.toastService.success(successMessage);

        setTimeout(() => {
          this.router.navigate(['/login'], {
            state: { signupSuccess: successMessage }
          });
        }, 1000);
      },
      error: (err) => {
        const backendMessage = typeof err.error === 'string'
          ? err.error
          : err.error?.message || 'Something went wrong';

        this.toastService.error(backendMessage);
        this.ngZone.run(() => this.cdr.detectChanges());
      }
    });
  }

  get f() {
    return this.signupForm.controls;
  }
}

