import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { map, shareReplay } from 'rxjs/operators';

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
  ) {}

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

  getDepartments():
  Observable<Department[]> {
    if (!this.departments$) {
      this.departments$ = this.http.get<{
        content: Department[]
      }>(
        this.deptUrl
      ).pipe(
        map(res => res.content),
        shareReplay(1)
      );
    }
    return this.departments$;
  }

  getDesignations():
  Observable<string[]> {
    if (!this.designations$) {
      this.designations$ = this.http.get<string[]>(
        this.designationUrl
      ).pipe(
        shareReplay(1)
      );
    }
    return this.designations$;
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