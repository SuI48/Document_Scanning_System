
import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { SidebarComponent } from '../../sidebar/sidebar.component';

import { HttpClient } from '@angular/common/http';

import { CustomerService } from './customer.service';

import { UserService } from './user.service';

import { AuthService } from '../../auth/auth.service';




interface CommonUser {

  id: number;

  identityNumber?: string;

  firstName?: string;

  lastName?: string;

  role?: string;

  email: string;

  phone: string;

}




@Component({

  selector: 'app-user-list',

  templateUrl: './user-list.component.html',

  styleUrls: ['./user-list.component.css'],

  standalone: true,

  imports: [CommonModule, FormsModule, SidebarComponent]

})

export class UserListComponent implements OnInit {

  data: CommonUser[] = [];

  columns: { field: keyof CommonUser, header: string }[] = [];

  itemsPerPageOptions: number[] = [10, 15, 20, 30];

  currentPage = 1;

  itemsPerPage = 10;

  paginatedData: CommonUser[] = [];

  totalPages = 1;

  pages: number[] = [];

  tableTitle: string = '';

  

  isEditPopupOpen = false;

  isDeleteConfirmationOpen = false;

  isGeneralModalOpen = false;

  isPersonnel = false;

  selectedUser: CommonUser = {} as CommonUser;

  selectedUserForDeletion: CommonUser | null = null;




  customerFilter = { identityNumber: '', name: '' };

  personnelFilter = { name: '', role: '' };




  generalModalTitle = '';

  generalModalMessage = '';

  currentUserRole: string = ''; // Kullanıcının mevcut rolü




  constructor(

    private route: ActivatedRoute,

    private http: HttpClient,

    private customerService: CustomerService,

    private userService: UserService,

    private authService: AuthService

  ) {}




  private apiUrl1 = 'http://localhost:5000/api/userlist/userlist'; 

  private apiUrl2 = 'http://localhost:5000/api/customerlist/customerlist';




  ngOnInit() {

    this.route.paramMap.subscribe(params => {

      const type = params.get('type');

      if (type) {

        this.fetchData(type);

      }

    });

  

    // Kullanıcı rolünü authService üzerinden alın

    this.currentUserRole = this.authService.getUserRole();

  }

    




  fetchData(type: string) {

    let endpoint = '';

    

    if (type === 'personnel') {

      endpoint = this.apiUrl1;

      this.columns = [
        { field: 'id', header: 'Personel Numarası' },

        { field: 'firstName', header: 'Personel İsmi' },

        { field: 'lastName', header: 'Personel Soyismi' },

        { field: 'role', header: 'Rolü' },

        { field: 'email', header: 'Email' },

        { field: 'phone', header: 'Telefon Numarası' },

      ];

      this.tableTitle = 'Personel Listesi';

      this.isPersonnel = true;

    }

    else if (type === 'customer') {

      endpoint = this.apiUrl2;

      this.columns = [
        { field: 'id', header: 'Müşteri Numarası' },

        { field: 'identityNumber', header: 'Kimlik Numarası' },

        { field: 'firstName', header: 'Müşteri İsmi' },

        { field: 'lastName', header: 'Müşteri Soyismi' },

        { field: 'email', header: 'Email' },

        { field: 'phone', header: 'Telefon Numarası' },

      ];

      this.tableTitle = 'Müşteri Listesi';

      this.isPersonnel = false;

    }




    this.http.get<CommonUser[]>(endpoint).subscribe(

      (response) => {

        this.data = response.map(person => {

          if (person.firstName) {

            person.firstName = this.capitalizeFirstLetter(person.firstName);

          }

          if (person.lastName) {

            person.lastName = this.capitalizeFirstLetter(person.lastName);

          }

          if (person.role) {

            switch (person.role.toLowerCase()) {

              case 'admin':

                person.role = 'Admin';

                break;

              case 'manager':

                person.role = 'Yönetici';

                break;

              case 'personnel':

                person.role = 'Personel';

                break;

              default:

                break;

            }

          }

          return person;

        });

        this.applyFilter();

      },

      (error) => {

        console.error('Error fetching data:', error);

        this.showGeneralModal("Hata", "Veriler alınırken bir hata oluştu.");

      }

    );

  }




  applyFilter() {

    if (this.isPersonnel) {

        this.paginatedData = this.data.filter(user =>

            (!this.personnelFilter.name || user.firstName?.toLowerCase().includes(this.personnelFilter.name.toLowerCase()) ||

             user.lastName?.toLowerCase().includes(this.personnelFilter.name.toLowerCase())) &&

            (!this.personnelFilter.role || user.role?.toLowerCase().includes(this.personnelFilter.role.toLowerCase()))

        );

    } else {

        this.paginatedData = this.data.filter(user =>

            (!this.customerFilter.identityNumber || user.identityNumber?.includes(this.customerFilter.identityNumber)) &&

            (!this.customerFilter.name || 

                (user.firstName?.toLowerCase().includes(this.customerFilter.name.toLowerCase()) ||

                 user.lastName?.toLowerCase().includes(this.customerFilter.name.toLowerCase())))

        );




        // Eğer hiçbir filtre uygulanmamışsa, orijinal listeyi geri yükleyin

        if (!this.customerFilter.identityNumber && !this.customerFilter.name) {

            this.paginatedData = [...this.data];

        }

    }

    this.updatePagination();

  }




  updatePagination() {

    this.totalPages = Math.ceil(this.paginatedData.length / this.itemsPerPage);

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    this.paginatedData = this.paginatedData.slice(

      (this.currentPage - 1) * this.itemsPerPage, 

      this.currentPage * this.itemsPerPage

    );

  }




  goToPage(page: number) {

    this.currentPage = page;

    this.updatePagination();

  }




  previousPage() {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePagination();

    }

  }




  nextPage() {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.updatePagination();

    }

  }




  updateItemsPerPage(event: Event) {

    const selectElement = event.target as HTMLSelectElement;

    this.itemsPerPage = parseInt(selectElement.value, 10);

    this.currentPage = 1;

    this.updatePagination();

  }




  deleteUser(user: CommonUser): void {

    this.selectedUserForDeletion = user;

    this.isDeleteConfirmationOpen = true;

  }




  confirmDelete() {

    if (this.selectedUserForDeletion) {

      const userId = this.selectedUserForDeletion.id;

      if (!userId) {

        console.error('User ID is undefined, cannot delete user.');

        this.showGeneralModal("Hata", "Silme işlemi gerçekleştirilemedi.");

        this.closeDeleteConfirmation();

        return;

      }




      if (!this.isPersonnel) {

        this.customerService.deleteCustomer(userId).subscribe(

          () => {

            this.data = this.data.filter(u => u.id !== userId);

            this.updatePagination();

            this.showGeneralModal("Başarı", "Müşteri başarıyla silindi.");

            this.closeDeleteConfirmation();

          },

          error => {

            console.error('Error deleting customer:', error);

            this.showGeneralModal("Hata", "Müşteri silinirken bir hata oluştu.");

            this.closeDeleteConfirmation();

          }

        );

      } else {

        this.userService.deleteUser(userId, this.authService.getEmail()).subscribe(

          () => {

            this.data = this.data.filter(u => u.id !== userId);

            this.updatePagination();

            this.showGeneralModal("Başarı", "Kullanıcı başarıyla silindi.");

            this.closeDeleteConfirmation();

          },

          error => {

            console.error('Error deleting user:', error);

            this.showGeneralModal("Hata", "Kullanıcı silinirken bir hata oluştu.");

            this.closeDeleteConfirmation();

          }

        );

      }

    }

  }




  cancelDelete() {

    this.closeDeleteConfirmation();

  }




  closeDeleteConfirmation() {

    this.isDeleteConfirmationOpen = false;

    this.selectedUserForDeletion = null;

  }




  openEditPopup(user: CommonUser) {

    this.selectedUser = { ...user };

    this.isEditPopupOpen = true;

  }




  closeEditPopup() {

    this.isEditPopupOpen = false;

  }




  submitEditForm() {

    if (!this.validateForm()) return;




    // Edit user or customer based on type

    if (this.isPersonnel) {

      this.userService.updateUser(this.selectedUser, this.authService.getEmail()).subscribe(

        () => {

          // Update local data

          const index = this.data.findIndex(u => u.id === this.selectedUser.id);

          if (index !== -1) {

            this.data[index] = { ...this.selectedUser };

          }

          this.updatePagination();

          this.showGeneralModal("Başarı", "Kullanıcı başarıyla güncellendi.");

          this.isEditPopupOpen = false;

        },

        error => {

          console.error('Error updating user:', error);

          this.showGeneralModal("Hata", "Kullanıcı güncellenirken bir hata oluştu.");

        }

      );

    }

    else {

      this.customerService.updateCustomer(this.selectedUser.id, this.selectedUser).subscribe(

        () => {

          // Update local data

          const index = this.data.findIndex(u => u.id === this.selectedUser.id);

          if (index !== -1) {

            this.data[index] = { ...this.selectedUser };

          }

          this.updatePagination();

          this.showGeneralModal("Başarı", "Müşteri başarıyla güncellendi.");

          this.isEditPopupOpen = false;

        },

        error => {

          console.error('Error updating customer:', error);

          this.showGeneralModal("Hata", "Müşteri güncellenirken bir hata oluştu.");

        }

      );

    }

  }




  validateForm(): boolean {

    let isValid = true;

    let errorMessages: string[] = [];




    if (!this.selectedUser.firstName) {

      errorMessages.push("İsim zorunludur.");

      isValid = false;

    }

    if (!this.selectedUser.lastName) {

      errorMessages.push("Soyisim zorunludur.");

      isValid = false;

    }

    if (!this.selectedUser.email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.selectedUser.email)) {

      errorMessages.push("Geçerli bir email adresi giriniz.");

      isValid = false;

    }

    if (!this.selectedUser.phone || !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(this.selectedUser.phone)) {

      errorMessages.push("Geçerli bir telefon numarası giriniz.");

      isValid = false;

    }

    if (this.isPersonnel && !this.selectedUser.role) {

      errorMessages.push("Rolü seçiniz.");

      isValid = false;

    }

    if (!this.isPersonnel && !this.selectedUser.identityNumber) {

      errorMessages.push("Kimlik numarası zorunludur.");

      isValid = false;

    }




    if (!isValid) {

      const combinedMessage = errorMessages.join(' ');

      this.showGeneralModal("Geçersiz Giriş", combinedMessage);

    }




    return isValid;

  }




  isInvalid(fieldName: keyof CommonUser): boolean {

    return !this.selectedUser[fieldName];

  }




  showGeneralModal(title: string, message: string) {

    this.generalModalTitle = title;

    this.generalModalMessage = message;

    this.isGeneralModalOpen = true;

  }




  closeGeneralModal() {

    this.isGeneralModalOpen = false;

  }




  capitalizeFirstLetter(text: string): string {

    if (!text) return ''; 




    return text

      .split(' ')

      .map(word => word.charAt(0).toUpperCase() + word.slice(1))

      .join(' ');

  }

}
