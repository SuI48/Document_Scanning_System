import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

interface Customer {
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
}

interface Document {
  Email: string;
  CustomerID: string;
  DocumentName: string;
  DocumentType: string;
  Time: string;
  URL: string;
  type: string;
}

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent]
})
export class DocumentUploadComponent {
  customerID: string = '';
  customer: Customer | null = null;
  selectedDocumentType: string = '';
  selectedDocumentFormat: string = '';
  scanResult: any = null;
  isScanning: boolean = false;
  customerFound: boolean = false;
  folderName: string = '';
  email: string = '';
  url: string = '';
  
  showPopup: boolean = false;
  popupMessage: string = '';
  popupType: 'success' | 'error' = 'success';

  private apiUrl = 'http://localhost:5000/api/customerfind/customerfind'; // Müşteri bilgileri için backend URL
  private scanApiUrl = 'http://localhost:5000/api/scanner/scan'; // Tarama işlemi için backend URL
  private uploadApiUrl = 'http://localhost:5000/api/documentadd/documentadd'; // Belge yükleme işlemi için backend URL

  constructor(private http: HttpClient, private authService: AuthService) {}

  showAlert(message: string, type: 'success' | 'error') {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;

    //Popuplar eğer manuel olarak kapatılmazsa 10 saniye sonra otomatik kapatılacak.
    setTimeout(() => {
      this.closePopup();
    }, 10000);
  }

  closePopup() {
    this.showPopup = false;
  }

  fetchCustomerDetails() {
    if (!this.customerID) {
      this.showAlert('Lütfen müşteri kimliğini girin.', 'error');
      return;
    }

    this.http.get<Customer>(`${this.apiUrl}?IdentityNumber=${this.customerID}`)
      .subscribe(
        (response: Customer) => {
          this.customer = response;
          this.customerFound = true;
        },
        (error) => {
          console.error('Müşteri bulunamadı veya bir hata oluştu:', error);
          this.showAlert('Müşteri bulunamadı.', 'error');
          this.customerFound = false;
          this.customer = null;
        }
      );
  }

  startScan() {
    if (!this.selectedDocumentType) {
      this.showAlert('Lütfen bir belge kategorisi seçin.', 'error');
      return;
    }

    if (!this.selectedDocumentFormat) {
      this.showAlert('Lütfen işlem yapmak istediğiniz doküman formatını seçin.', 'error');
      return;
    }
    if (!this.customerFound) {
      this.showAlert('Lütfen önce müşteri bilgilerini doğrulayın.', 'error');
      return;
    }

    this.isScanning = true;
    this.scanResult = null;
    this.folderName = `${this.selectedDocumentType}\\${this.customerID}`;
    

    setTimeout(() => {
      this.http.get(`${this.scanApiUrl}?folderName=${this.folderName}&fileType=${this.selectedDocumentFormat}`).subscribe(
        (response: any) => {
          console.log('Tarama işlemi tamamlandı:', response);
          this.scanResult = response;
          this.isScanning = false;
          this.showAlert('Tarama işlemi tamamlandı.', 'success');
        },
        (error) => {
          console.error('Tarama işlemi sırasında hata oluştu:', error);
          this.scanResult = { message: 'Tarama sırasında hata oluştu.', success: false };
          this.isScanning = false;
          this.showAlert('Tarama sırasında hata oluştu.', 'error');
        }
      );
    }, 5000);
  }

  uploadDocument() {
    if (!this.scanResult || !this.scanResult.success) {
      this.showAlert('Yüklenecek geçerli bir belge yok.', 'error');
      return;
    }

    this.email = this.authService.getEmail();
    //const now = new Date().toISOString();
    const turkeyTime = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());
    this.url = "assets\\" + this.folderName;

    const documentData: Document = {
      Email: this.email,
      CustomerID: this.customerID,
      DocumentName: this.selectedDocumentType +"_"+ this.customerID,
      DocumentType: this.selectedDocumentType,
      Time: turkeyTime,
      URL: this.url,
      type: this.selectedDocumentFormat
    };

    this.http.post<boolean>(this.uploadApiUrl, documentData).subscribe(
      (response) => {
        if (response) {
          this.showAlert('Belge başarıyla yüklendi.', 'success');
        } else {
          this.showAlert('Belge yükleme başarısız oldu.', 'error');
        }
      },
      (error) => {
        console.error('Belge yükleme sırasında hata oluştu:', error);
        this.showAlert('Belge yükleme sırasında hata oluştu.', 'error');
      }
    );
  }
}
