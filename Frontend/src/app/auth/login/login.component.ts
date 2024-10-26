import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  model: any = {}; 
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(loginForm: any) {
    this.authService.login(this.model.email, this.model.password).subscribe(success => {
      if (success) {
        const role = this.authService.getUserRole();
        if (role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'personnel') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'manager') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMessage = 'Geçersiz kullanıcı adı veya şifre';
      }
    });
  }
}
