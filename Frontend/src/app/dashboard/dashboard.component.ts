import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { DocumentService } from './document.service';
import { CustomerService } from './customer.service';
import { NameService } from './name.service';
import { DocumentDto } from '../document-management/document-list/document.dto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, SidebarComponent]
})
export class DashboardComponent implements OnInit {
  role: string = '';
  documents: DocumentDto[] = [];
  document_count: number = 0;
  customer_count: number = 0;
  name: string = '';
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private documentService: DocumentService,
    private customerService: CustomerService,
    private nameService: NameService
  ) {}

  ngOnInit() {
    this.role = this.authService.getUserRole();
    this.loadRecentDocuments();
    this.documentService.documentCount().subscribe(data => {
      this.document_count = data;
    });
    this.customerService.customerCount().subscribe(data => {
      this.customer_count = data;
    });
    this.email = this.authService.getEmail();
    this.nameService.getName(this.email).subscribe(data => {
      this.name = this.capitalizeFirstLetter(data);
    });
  }

  loadRecentDocuments(): void {
    this.documentService.getRecentDocuments().subscribe((data: DocumentDto[]) => {
      if (Array.isArray(data)) {
        data.forEach((doc) => {
          if(doc.documentCategory === 'identity'){
            doc.documentCategory = 'Kimlik'
          }
          else if(doc.documentCategory === 'passport'){
            doc.documentCategory = 'Pasaport'
          }
          else if(doc.documentCategory === 'document'){
            doc.documentCategory = 'Doküman'
          }
        });
      }
      this.documents = data;  
    });
  }
  /*
  loadRecentDocuments() {
    this.documentService.getRecentDocuments().subscribe(data: DocumentDto[] => {
      console.log("Fetched Documents: ", data);  
      if (Array.isArray(data)) {
        data.forEach((doc, index) => {
          console.log(`Document ${index + 1}:`, doc);
        });
      }
      this.documents = data;  
    });
  }
  */
  

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return ''; 
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
