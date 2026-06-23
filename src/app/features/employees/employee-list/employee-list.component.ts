import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService, Department } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../../core/services/toast.service';
import { PresenceService, Lock, ActivityLog } from '../../../core/services/presence.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees = signal<Employee[]>([]);
  departments: Department[] = [];
  editForm!: FormGroup;
  editing = false;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  searchTerm = '';
  loading = signal(false);

  // Collaboration variables
  activeLocks: Lock[] = [];
  activityLogs: ActivityLog[] = [];
  showActivityFeed = false;
  private locksSub?: Subscription;
  private logsSub?: Subscription;

  private searchSubject = new Subject<string>();

  constructor(
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private toastService: ToastService,
    private presenceService: PresenceService
  ) {
    this.searchSubject.pipe(debounceTime(1000)).subscribe(term => {
      console.log('Debounce fired at:', new Date().toLocaleTimeString(), 'with term:', term);
      this.searchTerm = term;
      this.page = 0;
      this.loadEmployees();
    });
  }

  pageSizeOptions: number[] = [10, 25, 50, 75, 100];
  sizes = 10; // default

  onPageSizeChange(event: any) {
    this.sizes = +event.target.value; // update page size
    this.page = 0;                   // reset to first page
    this.loadEmployees();            // reload with new size
  }

  ngOnInit(): void {
    const state = this.location.getState() as { successMessage?: string };
    const successMsg = state?.successMessage;
    if (successMsg) {
      this.toastService.success(successMsg);
    }

    this.loadEmployees();
    this.loadDepartments();

    // Register active presence
    this.presenceService.updatePresence('Employee Directory');

    // Subscribe to real-time locks
    this.locksSub = this.presenceService.activeLocks$.subscribe(locks => {
      this.activeLocks = locks;
    });

    // Subscribe to live activity stream
    this.logsSub = this.presenceService.activityStream$.subscribe(logs => {
      this.activityLogs = logs;
    });
  }

  ngOnDestroy(): void {
    if (this.locksSub) this.locksSub.unsubscribe();
    if (this.logsSub) this.logsSub.unsubscribe();
  }

  getEmployeeLock(id: number): Lock | undefined {
    return this.activeLocks.find(l => l.employeeId === id);
  }

  toggleActivityFeed(): void {
    this.showActivityFeed = !this.showActivityFeed;
  }

  loadEmployees() {
    this.loading.set(true);

    const request$ = this.searchTerm && this.searchTerm.trim().length > 0
      ? this.employeeService.getEmployeesFilter(this.page, this.size, this.searchTerm)
      : this.employeeService.getEmployees(this.page, this.size);

    request$.subscribe({
      next: (response) => {
        this.employees.set(response.content.map(emp => ({ ...emp, selected: false })));
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearchChange(term: string) {
    console.log('User typed:', term, 'at', new Date().toLocaleTimeString());
    this.searchSubject.next(term);
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (response) => {
        this.departments = response;
      }
    });
  }

  /** 🔑 Pagination helpers */
  goToPage(pageIndex: number) {
    this.page = pageIndex;
    this.loadEmployees();
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadEmployees();
    }
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.loadEmployees();
    }
  }

  getDisplayedPages(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const maxVisible = 5;

    let start = Math.max(0, current - 2);
    let end = Math.min(total - 1, current + 2);

    if (current < 2) {
      end = Math.min(total - 1, maxVisible - 1);
    }
    if (current > total - 3) {
      start = Math.max(0, total - maxVisible);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  editEmployee(employee: Employee) {
    this.editing = true;
    this.editForm = this.fb.group({
      id: [employee.id],
      employeeCode: [employee.employeeCode, Validators.required],
      firstName: [employee.firstName, Validators.required],
      lastName: [employee.lastName, Validators.required],
      email: [employee.email, [Validators.required, Validators.email]],
      phone: [employee.phone, Validators.required],
      designation: [employee.designation, Validators.required],
      departmentId: [this.mapDeptNameToId(employee.departmentName), Validators.required],
      salary: [employee.salary, [Validators.required, Validators.min(0)]]
    });
  }

  cancelEdit() {
    this.editing = false;
  }

  showDeletePopup = false;
  employeeToDelete: Employee | null = null;

  deleteEmployeePrompt(employee: Employee) {
    this.employeeToDelete = employee;
    this.showDeletePopup = true;
  }

  confirmDelete() {
    if (!this.employeeToDelete) return;

    this.employeeService.deleteEmployee(this.employeeToDelete.id)
      .subscribe({
        next: (res: any) => {
          this.toastService.success(res.message || 'Employee deleted successfully');
          this.loadEmployees();
          this.showDeletePopup = false;
          this.employeeToDelete = null;
        },
        error: (err) => {
          this.showDeletePopup = false;
          this.employeeToDelete = null;
        }
      });
  }

  cancelDelete() {
    this.showDeletePopup = false;
    this.employeeToDelete = null;
  }

  private mapDeptNameToId(name: string): number | null {
    const dept = this.departments.find(d => d.name === name);
    return dept ? dept.id : null;
  }

  /** 🔑 Bulk selection */
  selectedIds: number[] = [];

  toggleSelection(id: number, checked: boolean) {
    if (checked) {
      if (!this.selectedIds.includes(id)) {
        this.selectedIds.push(id);
      }
    } else {
      this.selectedIds = this.selectedIds.filter(x => x !== id);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.selectedIds = this.employees().map(e => e.id);
    } else {
      this.selectedIds = [];
    }
  }

  showBulkDeletePopup = false;
  bulkDeleteEmails: string[] = [];

  getCurrentUserEmail(): string {
    const token = sessionStorage.getItem('token');
    if (!token) return '';
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.sub || payload.email || '';
      }
    } catch (e) {
      console.error('Failed to decode token', e);
    }
    return '';
  }

  deleteSelected() {
    if (this.selectedIds.length === 0) return;
    
    const selectedEmployees = this.employees().filter(e => this.selectedIds.includes(e.id));
    const currentUserEmail = this.getCurrentUserEmail();
    const lockedEmployees = selectedEmployees.filter(emp => {
      const lock = this.getEmployeeLock(emp.id);
      return lock && lock.lockedBy !== currentUserEmail;
    });

    if (lockedEmployees.length > 0) {
      const lockedNames = lockedEmployees.map(e => `${e.firstName} ${e.lastName}`).join(', ');
      this.toastService.error(`Cannot delete: Locked profiles are currently being edited: ${lockedNames}`);
      return;
    }

    this.bulkDeleteEmails = selectedEmployees.map(e => e.email);
    this.showBulkDeletePopup = true;
  }

  confirmBulkDelete() {
    this.employeeService.bulkDelete(this.selectedIds).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Bulk delete successful');
        this.loadEmployees();   // refresh list
        this.selectedIds = [];  // reset selection
      },
      error: (err) => {
        // Handled globally by ErrorInterceptor
      }
    });

    this.showBulkDeletePopup = false;
    this.bulkDeleteEmails = [];
  }

  cancelBulkDelete() {
    this.showBulkDeletePopup = false;
    this.bulkDeleteEmails = [];
  }

  bulkEdit() {
    if (this.selectedIds.length === 0) {
      console.warn('No employees selected for bulk edit');
      return;
    }

    const selectedEmployees = this.employees().filter(e => this.selectedIds.includes(e.id));
    const currentUserEmail = this.getCurrentUserEmail();
    const lockedEmployees = selectedEmployees.filter(emp => {
      const lock = this.getEmployeeLock(emp.id);
      return lock && lock.lockedBy !== currentUserEmail;
    });

    if (lockedEmployees.length > 0) {
      const lockedNames = lockedEmployees.map(e => `${e.firstName} ${e.lastName}`).join(', ');
      this.toastService.error(`Cannot edit: Locked profiles are currently being edited: ${lockedNames}`);
      return;
    }

    console.log('Navigating to bulk edit with employees:', selectedEmployees);

    this.router.navigate(['/employees/bulk-edit'], {
      state: { employees: selectedEmployees }
    });
  }
}