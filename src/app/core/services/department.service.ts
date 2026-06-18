import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface DepartmentResponse {
  content: Department[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl =
`${environment.deptBaseUrl}/api/department`;
  

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(this.apiUrl);
  }
}
