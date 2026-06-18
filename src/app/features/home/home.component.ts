import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../auth/login/login.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LoginComponent, SignupComponent,TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  ngOnInit() {
  console.log('HomeComponent loaded');
}

  activeView: 'home' | 'login' | 'signup' = 'home';

  toggleLogin() {
    this.activeView = 'login';
  }

  toggleSignUp() {
    this.activeView = 'signup';
  }

  backToHome() {
    this.activeView = 'home';
  }
}
