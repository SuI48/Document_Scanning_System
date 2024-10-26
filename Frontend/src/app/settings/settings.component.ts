import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserService } from '../auth/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent]
})
export class SettingsComponent implements OnInit {
  passwordData = {
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };
  passwordMismatch = false;
  passwordChanged = false;
  emailError = false;
  currentPasswordError = false;
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.passwordData.email = this.userService.getUserEmail();  // Email'i ayarla
    console.log('User email retrieved: ', this.passwordData.email);
  }

  onSubmit(form: any): void {
    this.resetErrors();
    this.passwordMismatch = this.passwordData.newPassword !== this.passwordData.confirmNewPassword;

    if (this.passwordMismatch) {
      this.errorMessage = 'Şifreler uyuşmuyor!';
      return;
    }

    this.userService.changePassword(
      this.passwordData.email,
      this.passwordData.currentPassword,
      this.passwordData.newPassword,
      this.passwordData.confirmNewPassword
    ).subscribe(
      response => {
        this.passwordChanged = true;
        form.resetForm();
      },
      error => {
        this.passwordChanged = false;

        if (error.error.includes('Invalid old password')) {
          this.currentPasswordError = true;
          this.errorMessage = 'Lütfen eski şifrenizi doğru giriniz!';
        } else if (error.error.includes('Invalid email')) {
          this.emailError = true;
          this.errorMessage = 'Geçersiz e-posta adresi!';
        } else {
          this.errorMessage = 'Şifre değiştirilirken bir hata oluştu.';
        }
      }
    );
  }

  resetErrors() {
    this.emailError = false;
    this.currentPasswordError = false;
    this.passwordMismatch = false;
    this.errorMessage = '';
  }

  closeErrorPopup() {
    this.resetErrors();
  }

  closeSuccessPopup() {
    this.passwordChanged = false;
  }
}