import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, of, timer } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Presence {
  email: string;
  activePage: string;
  lastActive: number;
}

export interface Lock {
  employeeId: number;
  lockedBy: string;
  lockedAt: number;
  expiresAt: number;
}

export interface ActivityLog {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private apiUrl = `${environment.apiBaseUrl}/api/employees`;

  private onlineUsers = new BehaviorSubject<Presence[]>([]);
  public onlineUsers$ = this.onlineUsers.asObservable();

  private activeLocks = new BehaviorSubject<Lock[]>([]);
  public activeLocks$ = this.activeLocks.asObservable();

  private activityStream = new BehaviorSubject<ActivityLog[]>([]);
  public activityStream$ = this.activityStream.asObservable();

  private pollingSub?: Subscription;
  private currentPage = 'Dashboard';

  constructor(private http: HttpClient) {
    this.startPresenceAndLockPolling();
    this.registerTabCloseHandler();
  }

  private registerTabCloseHandler(): void {
    window.addEventListener('beforeunload', () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        // Send a synchronous beacon/keepalive fetch to immediately clear presence from Firestore
        fetch(`${this.apiUrl}/presence`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          keepalive: true
        });
      }
    });
  }

  updatePresence(page: string): void {
    this.currentPage = page;
    if (!sessionStorage.getItem('token')) return;
    this.http.post(`${this.apiUrl}/presence?page=${encodeURIComponent(page)}`, {}).subscribe({
      error: (err) => console.error('Failed to update presence', err)
    });
  }

  acquireLock(employeeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/locks/${employeeId}`, {});
  }

  releaseLock(employeeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/locks/${employeeId}`);
  }

  private startPresenceAndLockPolling(): void {
    // Poll every 5 seconds
    this.pollingSub = timer(0, 5000).pipe(
      switchMap(() => {
        if (!sessionStorage.getItem('token')) {
          return of([]);
        }
        
        // Announce presence
        this.http.post(`${this.apiUrl}/presence?page=${encodeURIComponent(this.currentPage)}`, {}).subscribe({
          error: () => {}
        });

        // Fetch online users
        this.http.get<Presence[]>(`${this.apiUrl}/presence`).subscribe({
          next: (users) => this.onlineUsers.next(users),
          error: (err) => console.error('Failed to get presence', err)
        });

        // Fetch active locks
        this.http.get<Lock[]>(`${this.apiUrl}/locks`).subscribe({
          next: (locks) => this.activeLocks.next(locks),
          error: (err) => console.error('Failed to get locks', err)
        });

        // Fetch activity logs
        return this.http.get<ActivityLog[]>(`${this.apiUrl}/activity`).pipe(
          tap((logs) => this.activityStream.next(logs)),
          catchError((err) => {
            console.error('Failed to get live activities', err);
            return of([]);
          })
        );
      })
    ).subscribe();
  }

  stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  clearPresence(): Observable<any> {
    this.stopPolling();
    this.onlineUsers.next([]);
    if (!sessionStorage.getItem('token')) return of(null);
    return this.http.delete(`${this.apiUrl}/presence`).pipe(
      catchError(() => of(null))
    );
  }
}
