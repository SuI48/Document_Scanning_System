import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-user-activities',
  templateUrl: './user-activities.component.html',
  styleUrls: ['./user-activities.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent]
})
export class UserActivitiesComponent implements OnInit {
  activities: any[] = [
    { user: 'Admin A', role: 'Admin', action: 'Döküman Onaylama', details: 'Pasaport Yenileme', date: '01-07-2024', time: '10:30' },
    { user: 'Yönetici B', role: 'Yönetici', action: 'Kullanıcı Ekleme', details: 'Yeni personel eklendi', date: '01-07-2024', time: '11:00' },
    { user: 'Personel C', role: 'Personel', action: 'Döküman Yükleme', details: 'Dekont Yüklendi', date: '01-07-2024', time: '11:15' },
    { user: 'Admin A', role: 'Admin', action: 'Kullanıcı Silme', details: 'Personel X silindi', date: '01-07-2024', time: '12:00' },
    { user: 'Yönetici B', role: 'Yönetici', action: 'Döküman Güncelleme', details: 'Pasaport bilgileri güncellendi', date: '01-07-2024', time: '13:00' },
    { user: 'Personel C', role: 'Personel', action: 'Müşteri Ekleme', details: 'Yeni müşteri eklendi', date: '01-07-2024', time: '14:00' },
    { user: 'Admin A', role: 'Admin', action: 'Kullanıcı Rolü Güncelleme', details: 'Personel Y yöneticilik rolü verildi', date: '01-07-2024', time: '14:30' },
    { user: 'Yönetici B', role: 'Yönetici', action: 'Döküman Silme', details: 'Eski pasaport belgesi silindi', date: '01-07-2024', time: '15:00' },
    { user: 'Personel C', role: 'Personel', action: 'Talep Oluşturma', details: 'Yeni pasaport talebi oluşturuldu', date: '01-07-2024', time: '15:30' },
    { user: 'Admin A', role: 'Admin', action: 'Personel Güncelleme', details: 'Personel Z bilgileri güncellendi', date: '01-07-2024', time: '16:00' },
    { user: 'Yönetici B', role: 'Yönetici', action: 'Kullanıcı Rolü Güncelleme', details: 'Personel Y yöneticilik rolü verildi', date: '01-07-2024', time: '16:30' },
    { user: 'Personel C', role: 'Personel', action: 'Döküman İndirme', details: 'Dekont indirildi', date: '01-07-2024', time: '17:00' },
    { user: 'Admin A', role: 'Admin', action: 'Müşteri Silme', details: 'Müşteri A silindi', date: '01-07-2024', time: '17:30' },
  ];

  filteredActivities: any[] = [];
  filters = {
    user: '',
    role: '',
    action: ''
  };

  currentPage = 1;
  itemsPerPage = 10;
  itemsPerPageOptions = [10, 15, 20, 30];
  paginatedActivities: any[] = [];
  totalPages = 1;
  pages: number[] = [];

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredActivities = this.activities.filter(activity => {
      return (
        (this.filters.user === '' || activity.user.toLowerCase().includes(this.filters.user.toLowerCase())) &&
        (this.filters.role === '' || activity.role.toLowerCase().includes(this.filters.role.toLowerCase())) &&
        (this.filters.action === '' || activity.action.toLowerCase().includes(this.filters.action.toLowerCase()))
      );
    });
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredActivities.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.paginatedActivities = this.filteredActivities.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
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

  viewDetails(activity: any): void {
    console.log('Hareket Detayları:', activity);
  }
}


