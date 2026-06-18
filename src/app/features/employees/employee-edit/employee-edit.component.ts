import {
  Component,
  OnInit
} from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import {
  CommonModule
} from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  EmployeeService,
  Department
} from '../../../core/services/employee.service';

import {
  EmployeeRequestDto
} from '../../../core/models/employee-request.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.css']
})
export class EmployeeEditComponent implements OnInit {
  editForm!: FormGroup;
  departments: Department[] = [];
  designations: string[] = [];
  employeeId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private toastService: ToastService
  ) {}

  successMessage: string | null = null;
  
  ngOnInit(): void {
    this.editForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+91', Validators.required],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      designation: ['', Validators.required],
      departmentId: [null, Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]]
    });

    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadDepartments();
    this.loadDesignations();
  }

  loadDepartments(): void {
    this.employeeService.getDepartments().subscribe({
      next: (res) => {
        this.departments = res;
        this.loadEmployee();
      }
    });
  }

  loadDesignations(): void {
    this.employeeService.getDesignations().subscribe({
      next: (res) => {
        this.designations = res;
      }
    });
  }

  loadEmployee(): void {
    this.employeeService.getEmployee(this.employeeId).subscribe(emp => {
      const dept = this.departments.find(d => d.name === emp.departmentName);
      
      const phoneStr = emp.phone || '';
      let countryCode = '+91';
      let phone = phoneStr;
      if (phoneStr.startsWith('+')) {
        countryCode = phoneStr.substring(0, 3);
        phone = phoneStr.substring(3);
      }

      this.editForm.patchValue({
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        countryCode: countryCode,
        phone: phone,
        designation: emp.designation,
        salary: emp.salary,
        departmentId: dept ? dept.id : null
      });
    });
  }

  saveEmployee(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const { countryCode, ...formValue } = this.editForm.value;
    const payload: EmployeeRequestDto = {
      ...formValue,
      phone: `${countryCode}${formValue.phone}`
    };

    this.employeeService.updateEmployee(this.employeeId, payload).subscribe({
      next: () => {
        this.toastService.success('Employee updated successfully');
        this.router.navigate(['/employees']);
      },
      error: () => {
        // Handled globally by ErrorInterceptor, avoiding double toast popup.
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}

