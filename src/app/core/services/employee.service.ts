import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { map, shareReplay, tap } from 'rxjs/operators';

import { EmployeeResponseDto }
from '../models/employee-response.model';

import { EmployeeRequestDto }
from '../models/employee-request.model';

import { PageResponse }
from '../models/paginated-response.model';

import { environment } from '../../environments/environment';
import { Employee } from '../models/employee.model';

export interface Department {

  id: number;

  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private departments$?: Observable<Department[]>;
  private designations$?: Observable<string[]>;

    private apiUrl =
`${environment.apiBaseUrl}/api/employees`;


 private createEmployeeUrl =
`${environment.apiBaseUrl}/api/employees/create`;





     private filterUrl =
    `${environment.apiBaseUrl}/api/employees/filter`;

  private deptUrl =
    `${environment.apiBaseUrl}/api/department`;

  private designationUrl =
     `${environment.apiBaseUrl}/api/employees/designations`;

  constructor(
    private http: HttpClient
  ) {
    // If user is already logged in on app start, preload the cache
    if (sessionStorage.getItem('token')) {
      this.preloadCache();
    }
  }

  preloadCache(): void {
    console.log('Preloading departments and designations cache from EmployeeService...');
    this.getDepartments(true).subscribe({
      next: () => console.log('Departments preloaded successfully.'),
      error: (err) => console.error('Failed to preload departments:', err)
    });
    this.getDesignations(true).subscribe({
      next: () => console.log('Designations preloaded successfully.'),
      error: (err) => console.error('Failed to preload designations:', err)
    });
  }

  clearCache(): void {
    console.log('Clearing departments and designations cache from EmployeeService...');
    sessionStorage.removeItem('cached_departments');
    sessionStorage.removeItem('cached_designations');
    this.departments$ = undefined;
    this.designations$ = undefined;
  }

  getEmployees(
    page: number,
    size: number
  ): Observable<PageResponse<EmployeeResponseDto>> {

    return this.http.get<
      PageResponse<EmployeeResponseDto>
    >(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }

  getEmployee(
    id: number
  ): Observable<EmployeeResponseDto> {

    return this.http.get<EmployeeResponseDto>(
      `${this.apiUrl}/${id}`
    );
  }

  updateEmployee(
    id: number,
    employee: EmployeeRequestDto
  ): Observable<EmployeeResponseDto> {

    return this.http.put<EmployeeResponseDto>(
      `${this.apiUrl}/${id}`,
      employee
    );
  }


  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.createEmployeeUrl, employee);
  }

 deleteEmployee(id: number): Observable<any> {
  return this.http.delete<any>(
    `${this.apiUrl}/${id}`
  );
}

  getDepartments(forceRefresh = false):
  Observable<Department[]> {
    if (!forceRefresh) {
      const cached = sessionStorage.getItem('cached_departments');
      if (cached) {
        try {
          return of(JSON.parse(cached));
        } catch (e) {
          // ignore parsing error
        }
      }
    }
    return this.http.get<{
      content: Department[]
    }>(
      this.deptUrl
    ).pipe(
      map(res => res.content),
      tap(depts => {
        sessionStorage.setItem('cached_departments', JSON.stringify(depts));
      })
    );
  }

  getDesignations(forceRefresh = false):
  Observable<string[]> {
    if (!forceRefresh) {
      const cached = sessionStorage.getItem('cached_designations');
      if (cached) {
        try {
          return of(JSON.parse(cached));
        } catch (e) {
          // ignore parsing error
        }
      }
    }
    return this.http.get<string[]>(
      this.designationUrl
    ).pipe(
      tap(desigs => {
        sessionStorage.setItem('cached_designations', JSON.stringify(desigs));
      })
    );
  }


getEmployeesFilter(page: number, size: number, search?: string): Observable<PageResponse<EmployeeResponseDto>> {
  let url = `${this.filterUrl}?page=${page}&size=${size}`;
  if (search && search.trim().length > 0) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return this.http.get<PageResponse<EmployeeResponseDto>>(url);
}


bulkDelete(ids: number[]): Observable<{ deletedCount: number; deletedIds: number[]; message: string }> {
  return this.http.request<{ deletedCount: number; deletedIds: number[]; message: string }>(
    'delete',
    `${this.apiUrl}/bulk-delete`,
    { body: ids }
  );
}






 bulkCreate(employees: EmployeeRequestDto[]): Observable<EmployeeResponseDto[]> {
  return this.http.post<EmployeeResponseDto[]>(`${this.apiUrl}/bulk-create`, employees);
}


  // Bulk update: expects array of EmployeeRequestDto with IDs
  bulkUpdate(employees: EmployeeRequestDto[]): Observable<EmployeeResponseDto[]> {
    return this.http.put<EmployeeResponseDto[]>(`${this.apiUrl}/bulk-update`, employees);
  }

}