import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-request-approve',
  templateUrl: './request-approve.component.html',
  styleUrls: ['./request-approve.component.css'],
  standalone: true,
  imports: [CommonModule, SidebarComponent]
})
export class RequestApproveComponent {
  requests: any[] = [
    { type: 'Güncelleme', details: 'İsim değişikliği', personnel: 'Ferhat Kasım Koç', customer: 'Müşteri A', date: '2023-07-19', status: 'Bekliyor' },
  ];

  approveRequest(request: any): void {
    request.status = 'Onaylı';
  }

  rejectRequest(request: any): void {
   request.status = 'Reddedildi';
  }
}
