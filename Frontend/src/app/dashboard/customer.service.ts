import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
    private apiUrl = 'http://localhost:5000/api/customercount/customercount'; //scanner ile baglanti kurmak icin bunu kaldirin

    constructor(private http: HttpClient) { }

    customerCount(){
        return this.http.get<number>(this.apiUrl);
    }
}