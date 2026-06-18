import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/api/auth`;
  private loggedIn = false;

  constructor(private http: HttpClient, private router: Router) {}

  login(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, request).pipe(
      tap((response: any) => {
        // ✅ Save token to sessionStorage
        sessionStorage.setItem('token', response.token);
        this.loggedIn = true;
        
        // ✅ Redirect after login success
        this.router.navigate(['/employees']);
      })
    );
  }

  signup(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sign-up`, request);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(['/home']);
      })
    );
  }

  clearSession(): void {
    sessionStorage.removeItem('token');
    this.loggedIn = false;
  }

  isLoggedIn(): boolean {
    return this.loggedIn || !!sessionStorage.getItem('token');
  }
}

