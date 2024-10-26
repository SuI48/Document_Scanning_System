import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-request-history',
  templateUrl: './request-history.component.html',
  styleUrls: ['./request-history.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent]
})
export class RequestHistoryComponent implements OnInit {
  role: string = '';

  processes: any[] = [
    { type: 'Güncelleme', details: 'İsim değişikliği', personnel: 'Ferhat Kasım Koç', manager: 'Ayça Çon', customer: 'Müşteri A', date: '2023-07-19', status: 'Onaylı', responseDate: '2023-07-20' },
    { type: 'Güncelleme', details: 'İsim değişikliği', personnel: 'Kasım Koç', manager: 'Ilgın Savas', customer: 'Müşteri A', date: '2023-07-19', status: 'Reddedildi', responseDate: '2023-07-20' },
  ];

  requests: any[] = [
    { customer: 'Müşteri A', identityNumber: '12345678901', documentType: 'Pasaport', type: 'Güncelleme', requestDate: '01-07-2024', responseDate: '02-07-2024', status: 'Onaylı', manager: 'Yönetici Y' },
    { customer: 'Müşteri B', identityNumber: '09876543210', documentType: 'Dekont', type: 'Silme', requestDate: '30-06-2024', responseDate: '01-07-2024', status: 'Bekliyor', manager: 'Yönetici Z' },
    { customer: 'Müşteri C', identityNumber: '23245126784', documentType: 'Pasaport', type: 'Güncelleme', requestDate: '04-02-2024', responseDate: '06-06-2024', status: 'Red', manager: 'Yönetici X' },
  ];

  filteredRequests: any[] = [];
  filters = {
    personnel: '',
    manager: '',
    status: '',
    customer: '',
    identityNumber: '',
    documentType: '',
    type: ''
  };

  currentPage = 1;
  itemsPerPage = 10;
  itemsPerPageOptions = [10, 15, 20, 30];
  paginatedRequests: any[] = [];
  totalPages = 1;
  pages: number[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.role = this.authService.getUserRole();
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.role === 'admin' || this.role === 'manager') {
      this.filteredRequests = this.processes.filter(request => {
        return (
          (this.filters.personnel === '' || request.personnel.toLowerCase().includes(this.filters.personnel.toLowerCase())) &&
          (this.filters.manager === '' || request.yonetici.toLowerCase().includes(this.filters.manager.toLowerCase())) &&
          (this.filters.status === '' || request.status === this.filters.status)
        );
      });
    } else if (this.role === 'personnel') {
      this.filteredRequests = this.requests.filter(request => {
        return (
          (this.filters.customer === '' || request.customer.toLowerCase().includes(this.filters.customer.toLowerCase())) &&
          (this.filters.identityNumber === '' || request.identityNumber.includes(this.filters.identityNumber)) &&
          (this.filters.documentType === '' || request.documentType.toLowerCase().includes(this.filters.documentType.toLowerCase())) &&
          (this.filters.type === '' || request.type.toLowerCase().includes(this.filters.type.toLowerCase())) &&
          (this.filters.status === '' || request.status === this.filters.status) &&
          (this.filters.manager === '' || request.manager.toLowerCase().includes(this.filters.manager.toLowerCase()))
        );
      });
    }
    this.updatePagination();
  }

  updatePagination(): void {
    const filteredData = this.filteredRequests;
    this.totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.paginatedRequests = filteredData.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  updateItemsPerPage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(selectElement.value, 10);
    this.currentPage = 1;
    this.updatePagination();
  }

  inspectRequest(request: any): void {
    // İşlem inceleme işlemleri
  }

  viewDetails(request: any): void {
    // Talep detaylarını görüntüleme işlemleri
  }
}
