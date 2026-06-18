import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { EmployeeListComponent } from './features/employees/employee-list/employee-list.component';
import { EmployeeEditComponent } from './features/employees/employee-edit/employee-edit.component';
import { DepartmentComponent } from './features/department/department.component';
import { CreateEmployeeComponent } from './features/employees/create-employee/create-employee.component';
import { BulkInsertComponent } from './features/employees/bulk-insert/bulk-insert.component';
import { MultiEditComponent } from './features/employees/bulk-edit/multi-edit.component';
import { AnalyticsWrapperComponent } from './analytics-wrapper/analytics-wrapper.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  { 
    path: 'employees/bulk-create', 
    component: BulkInsertComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'employees/bulk-edit', 
    component: MultiEditComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'analytics', 
    component: AnalyticsWrapperComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  { 
    path: 'employees/create', 
    component: CreateEmployeeComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'employees/edit/:id', 
    component: EmployeeEditComponent,
    canActivate: [authGuard]
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'employees',
    component: EmployeeListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'department',
    component: DepartmentComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];