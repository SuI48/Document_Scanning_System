import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentDto } from './document.dto';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private apiUrl = 'http://localhost:5000/api/document'; // Adjust this to match your backend URL

  constructor(private http: HttpClient) { }

  getDocuments(customerIdentity: string, documentCategory: string, personnelName: string): Observable<DocumentDto[]> {
    const params = {
      customerIdentity: customerIdentity || '',
      documentCategory: documentCategory || '',
      personnelName: personnelName || ''
    };

    return this.http.get<DocumentDto[]>(`${this.apiUrl}/filter`, { params });
  }

  getDocumentUrl(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/view/${id}`, { responseType: 'text' });
  }
}
