import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { EmployeeService, Department } from '../../../core/services/employee.service';
import { EmployeeResponseDto } from '../../../core/models/employee-response.model';
import { EmployeeRequestDto } from '../../../core/models/employee-request.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-multi-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './multi-edit.component.html',
  styleUrls: ['./multi-edit.component.css']
})
export class MultiEditComponent implements OnInit {
  employeesForm!: FormGroup;
  departments: Department[] = [];
  designations: string[] = [];
  showConfirmPopup = false;
  confirmEmails: string[] = [];
  selectedEmployees: EmployeeResponseDto[] = [];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.selectedEmployees = navigation?.extras.state?.['employees'] || history.state?.employees || [];
    console.log('Constructed MultiEditComponent. Selected employees:', this.selectedEmployees);
  }

  get employeesArray(): FormArray {
    return this.employeesForm.get('employees') as FormArray;
  }

  ngOnInit(): void {
    this.employeesForm = this.fb.group({ employees: this.fb.array([]) });

    console.log('BulkEditComponent initialized. Selected employees to process:', this.selectedEmployees);

    // Populate UI immediately so user sees the cards/rows right away!
    if (this.selectedEmployees && this.selectedEmployees.length > 0) {
      this.selectedEmployees.forEach(emp => this.addEmployeeRow(emp));
    } else {
      console.warn('No selected employees found in class state.');
    }
    this.cdr.detectChanges();

    // Fetch dropdowns in parallel without blocking UI population
    forkJoin({
      depts: this.employeeService.getDepartments(),
      desigs: this.employeeService.getDesignations()
    }).subscribe({
      next: ({ depts, desigs }) => {
        this.departments = depts;
        this.designations = desigs;
        console.log('Departments loaded:', this.departments);
        console.log('Designations loaded:', this.designations);

        // Since departments are now loaded, map the department name to its ID
        this.employeesArray.controls.forEach((control, index) => {
          const emp = this.selectedEmployees[index];
          if (emp) {
            const deptId = this.departments.find(d => d.name === emp.departmentName)?.id;
            control.get('departmentId')?.setValue(deptId);
          }
        });

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading configuration data in parallel:', err);
      }
    });
  }

  addEmployeeRow(emp: EmployeeResponseDto): void {
    const deptId = this.departments.find(d => d.name === emp.departmentName)?.id;
    console.log(`Mapping employee ${emp.id} departmentName=${emp.departmentName} → departmentId=${deptId}`);

    // Robust phone parsing
    const phoneStr = emp.phone || '';
    const digits = phoneStr.replace(/\D/g, '');
    let countryCode = '+91';
    let phone = digits;
    if (digits.length === 12 && digits.startsWith('91')) {
      countryCode = '+91';
      phone = digits.substring(2);
    } else if (digits.length > 10) {
      phone = digits.slice(-10);
      countryCode = '+' + digits.substring(0, digits.length - 10);
    }

    const formGroup = this.fb.group({
      id: [emp.id],
      firstName: [emp.firstName, Validators.required],
      lastName: [emp.lastName, Validators.required],
      email: [emp.email, [Validators.required, this.strictEmailValidator]],
      countryCode: [countryCode, Validators.required],
      phone: [phone, [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      designation: [emp.designation, Validators.required],
      departmentId: [deptId, Validators.required],
      salary: [emp.salary, [Validators.required, Validators.min(0)]]
    });

    this.employeesArray.push(formGroup);
    console.log('FormArray after adding employee:', this.employeesArray.value);
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

  openConfirmPopup(): void {
    if (this.employeesForm.invalid) {
      this.employeesForm.markAllAsTouched();
      this.toastService.warning('Please correct the validation errors in the form rows first.');
      return;
    }
    this.showConfirmPopup = true;
    this.confirmEmails = this.employeesArray.value.map((e: any) => e.email);
    console.log('openConfirmPopup called, showConfirmPopup=', this.showConfirmPopup);
  }

  confirmBulkUpdate(): void {
    const employeesPayload: EmployeeRequestDto[] = this.employeesArray.value.map((emp: any) => ({
      ...emp,
      phone: `${emp.countryCode}${emp.phone}`
    }));

    console.log('Bulk update payload:', employeesPayload);

    this.employeeService.bulkUpdate(employeesPayload).subscribe({
      next: (res) => {
        this.toastService.success(`${res.length} employees updated successfully`);
        this.showConfirmPopup = false;
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.showConfirmPopup = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelConfirm(): void {
    this.showConfirmPopup = false;
  }

  strictEmailValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : { emailInvalid: true };
  }
}
