import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,   // ✅ keep standalone true
  imports: [
    RouterOutlet,
    NavbarComponent,
    ToastContainerComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    this.translate.use('en'); // Use default lang 'en' as default start or sync with navbar
  }

  ngOnInit() {
    console.log('AppComponent loaded');
  }
}

