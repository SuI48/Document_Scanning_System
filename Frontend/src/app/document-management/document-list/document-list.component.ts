import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { DocumentService } from './document.service';
import { DocumentDto } from './document.dto';
import { MatDialog } from '@angular/material/dialog';
import { DocumentViewerComponent } from '../../document-viewer/document-viewer.component';

@Component({ 
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  providers: [DatePipe]  // DatePipe'ı burada sağlıyoruz
})
export class DocumentListComponent implements OnInit {
  documents: DocumentDto[] = [];
  filteredDocuments: DocumentDto[] = [];
  filters = {
    customerIdentity: '',
    type: '',
    personnel: ''
  };
  currentPage = 1;
  itemsPerPage = 10;
  itemsPerPageOptions = [10, 15, 20, 30];
  paginatedDocuments: DocumentDto[] = [];
  totalPages = 1;
  pages: number[] = [];

  constructor(private documentService: DocumentService, public dialog: MatDialog, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let type = '';
    if(this.filters.type === 'Kimlik'){
      type = 'identity';
    } else if(this.filters.type === 'Pasaport'){
      type = 'passport';
    } else if(this.filters.type === 'Doküman'){
      type = 'document';
    }

    this.documentService.getDocuments(this.filters.customerIdentity, type, this.filters.personnel)
      .subscribe((documents: DocumentDto[]) => {
        this.documents = documents;
        this.documents.forEach((document) => {
          if(document.documentCategory === 'identity'){
            document.documentCategory = 'Kimlik'
          }
          else if(document.documentCategory === 'passport'){
            document.documentCategory = 'Pasaport'
          }
          else if(document.documentCategory === 'document'){
            document.documentCategory = 'Doküman'
          }
          document.customerFullName = this.capitalizeFirstLetter(document.customerFullName);
          document.personnelFullName = this.capitalizeFirstLetter(document.personnelFullName);
        });
        this.updatePagination();
      });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.documents.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.paginatedDocuments = this.documents.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
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

  viewDetails(document: DocumentDto): void {
    this.documentService.getDocumentUrl(document.id).subscribe(url => {
      this.dialog.open(DocumentViewerComponent, {
        data: { 
          title: document.customerFullName, 
          url: url,
          format: document.type
        }, 
        panelClass: 'fullscreen-dialog'  
       });
    });
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';

    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
