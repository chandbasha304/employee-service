import { Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { PresenceService, Presence } from '../../core/services/presence.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TranslateModule  
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  onlineUsers: Presence[] = [];

  ngOnInit() {
    console.log('NavbarComponent loaded');
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService,
    private presenceService: PresenceService
  ) {
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('lang') || 'en';
    this.translate.use(savedLang);

    // Subscribe to online users
    this.presenceService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });
  }

  getOnlineUsersTooltip(): string {
    return this.onlineUsers
      .map(u => `${u.email} (${u.activePage})`)
      .join('\n');
  }

  changeLanguageEvent(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      const lang = selectElement.value;
      this.translate.use(lang);
      localStorage.setItem('lang', lang);
      window.dispatchEvent(new CustomEvent('langChange', { detail: lang }));
    }
  }

  get currentLang(): string {
    return this.translate.currentLang || 'en';
  }

isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  showLogoutPopup = false;

logout(): void {
  this.showLogoutPopup = true; // show popup box
}

confirmLogout(): void {
  this.authService.logout().subscribe({
    next: () => {
      sessionStorage.removeItem('token');
      this.router.navigateByUrl('/login');
    },
    error: () => {
      sessionStorage.removeItem('token');
      this.router.navigateByUrl('/login');
    }
  });
  this.showLogoutPopup = false;
}

cancelLogout(): void {
  this.showLogoutPopup = false;
}


searchTerm = '';

searchEmployees() {
  this.router.navigate(['/employees'], { queryParams: { search: this.searchTerm } });
}









}
