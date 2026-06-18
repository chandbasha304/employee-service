import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-bulk-insert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './bulk-insert.component.html',
  styleUrls: ['./bulk-insert.component.css']
})
export class BulkInsertComponent implements OnInit {
  employeesForm!: FormGroup;

  showConfirmPopup = false;
  showDeleteRowPopup = false;
  confirmEmails: string[] = [];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private toastService: ToastService
  ) {}

  departments: { id: number; name: string }[] = [];
  designations: string[] = [];

  ngOnInit() {
    this.employeesForm = this.fb.group({
      employees: this.fb.array([])
    });

    this.addEmployeeRow(); 
    this.employeeService.getDepartments().subscribe({
      next: (res) => this.departments = res
    });

    this.employeeService.getDesignations().subscribe({
      next: (res) => this.designations = res
    });
  }

  get employeesArray() {
    return this.employeesForm.get('employees') as FormArray;
  }

  addEmployeeRow() {
    this.employeesArray.push(this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+91', Validators.required],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      designation: ['', Validators.required],
      departmentId: ['', Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  deleteIndex: number | null = null;
  
  removeEmployeeRow(index: number) {
    this.deleteIndex = index;
    this.showDeleteRowPopup = true;
  }

  confirmDeleteRow() {
    if (this.deleteIndex !== null) {
      this.employeesArray.removeAt(this.deleteIndex);
      this.deleteIndex = null;
      this.toastService.success('Employee row removed.');
    }
    this.showDeleteRowPopup = false;
  }

  cancelDeleteRow() {
    this.showDeleteRowPopup = false;
    this.deleteIndex = null;
  }

  openConfirmPopup() {
    if (this.employeesForm.invalid) {
      this.employeesForm.markAllAsTouched();
      this.toastService.warning('Please correct the validation errors in the form rows first.');
      return;
    }
    this.confirmEmails = this.employeesArray.value.map((e: any) => e.email);
    this.showConfirmPopup = true;
  }

  confirmBulkInsert() {
    const employeesPayload = this.employeesArray.value.map((emp: any) => ({
      ...emp,
      phone: `${emp.countryCode}${emp.phone}`
    }));

    this.employeeService.bulkCreate(employeesPayload).subscribe({
      next: (res) => {
        this.toastService.success(`${res.length} employees inserted successfully`);
        this.showConfirmPopup = false;
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.showConfirmPopup = false;
      }
    });
  }

  cancelConfirm() {
    this.showConfirmPopup = false;
    this.confirmEmails = [];
  }
}
