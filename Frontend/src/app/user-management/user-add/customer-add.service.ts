import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerAddService {
    private apiUrl = 'http://localhost:5000/api/customeradd/customeradd';  // Müşteri eklemek için API URL

    constructor(private http: HttpClient) { }
    
    add_customer(customer: Customer): Observable<boolean> {
      return this.http.post<boolean>(this.apiUrl, customer);  // Müşteri ekleme API çağrısı
    }
}
