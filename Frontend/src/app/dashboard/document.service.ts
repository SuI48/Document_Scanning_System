import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentDto } from '../document-management/document-list/document.dto';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:5000/api/document';  

  constructor(private http: HttpClient) {}

  documentCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/documentcount`);
  }

  getRecentDocuments(): Observable<any[]> {
    return this.http.get<DocumentDto[]>(`${this.apiUrl}/recent`);
  }
}
