import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeeService, Department } from '../../../core/services/employee.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  createForm!: FormGroup;
  departments: Department[] = [];
  designations: string[] = [];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      countryCode: ['+91', Validators.required],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      designation: ['', Validators.required],
      departmentId: [null, Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]]
    });

    this.loadDepartments();
    this.loadDesignations();
  }

  loadDepartments(): void {
    this.employeeService.getDepartments().subscribe({
      next: (res) => this.departments = res
    });
  }

  loadDesignations(): void {
    this.employeeService.getDesignations().subscribe({
      next: (res) => this.designations = res
    });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.createForm.value,
      phone: `${this.createForm.value.countryCode}${this.createForm.value.phone}`
    };

    this.employeeService.createEmployee(payload).subscribe({
      next: () => {
        const successMsg = `Employee created successfully with email: ${this.createForm.value.email}`;
        this.toastService.success(successMsg);

        setTimeout(() => {
          this.router.navigate(['/employees'], {
            state: { successMessage: successMsg }
          });
        });
      },
      error: () => {
        // Handled globally by ErrorInterceptor, avoiding double toast popup.
      }
    });
  }

  get f() {
    return this.createForm.controls;
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}

