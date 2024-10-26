import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserAddService } from './user-add.service';
import { CustomerAddService } from './customer-add.service';
import { User } from '../user.model';
import { Customer } from '../customer.model';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserAddComponent implements OnInit {
  isPersonnel: boolean = false;
  formModel: any;
  successMessage: string = '';
  showSuccessPopup: boolean = false;
  showErrorPopup: boolean = false;

  user: User = {
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    password: '',
    phone: ''
  };

  customer: Customer = {
    firstName: '',
    lastName: '',
    email: '',
    identityNumber: '',
    phone: ''
  };

  constructor(
    private route: ActivatedRoute,
    private userAddService: UserAddService,
    private customerAddService: CustomerAddService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const type = params.get('type');
      this.isPersonnel = type === 'personnel';
      this.formModel = this.isPersonnel ? { ...this.user } : { ...this.customer };
      this.resetForm(null);
    });
  }

  validateField(userForm: NgForm, fieldName: string): void {
    const control = userForm.controls[fieldName];
    if (control.invalid && (control.dirty || control.touched)) {
      control.setErrors({ invalid: true });
    } else {
      control.setErrors(null);
    }
  }

  onSubmit(userForm: NgForm): void {
    if (!userForm.valid) {
      this.showErrorPopup = true;
      return;
    }

    this.showErrorPopup = false;

    if (this.isPersonnel) {
      this.formModel.role = this.getRoleId(this.formModel.role);

      this.userAddService.add_user(this.formModel).subscribe({
        next: (result: boolean) => {
          this.handleSuccess(result, 'Personel başarıyla eklendi!', userForm);
        },
        error: () => {
          this.handleError();
        }
      });
    } else {
      this.customerAddService.add_customer(this.formModel).subscribe({
        next: (result: boolean) => {
          this.handleSuccess(result, 'Müşteri başarıyla eklendi!', userForm);
        },
        error: () => {
          this.handleError();
        }
      });
    }
  }

  private getRoleId(role: string): string {
    switch (role) {
      case 'Yönetici':
        return 'manager';
      case 'Personel':
        return 'personnel';
      default:
        return '';
    }
  }

  private handleSuccess(result: boolean, successMsg: string, userForm: NgForm) {
    this.successMessage = result ? successMsg : 'Ekleme başarısız oldu.';
    this.showSuccessPopup = result;
    if (result) {
      this.resetForm(userForm);
    }
  }

  private handleError() {
    this.successMessage = 'Bir hata oluştu.';
  }

  private resetForm(userForm: NgForm | null) {
    this.formModel = this.isPersonnel ? { ...this.user } : { ...this.customer };

    if (userForm) {
      userForm.resetForm();
    }

    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach((msg) => {
      (msg as HTMLElement).style.display = 'none';
    });
  }

  closeSuccessPopup() {
    this.showSuccessPopup = false;
  }

  closeErrorPopup() {
    this.showErrorPopup = false;
  }
}
