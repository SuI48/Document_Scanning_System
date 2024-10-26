import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface CommonUser {
  id: number;
  identityNumber?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:5000/api/CustomerList';

  constructor(private http: HttpClient) { }

  deleteCustomer(id: number): Observable<void> {
    const url = `${this.apiUrl}/deleteCustomer/${id}`;
    return this.http.post<void>(url, {});
  }

  updateCustomer(id: number, customer: CommonUser): Observable<void> {
    const url = `${this.apiUrl}/updateCustomer/${id}`;
    return this.http.post<void>(url, customer);
  }
}
