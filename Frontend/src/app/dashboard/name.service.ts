import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NameService {
    private apiUrl = 'http://localhost:5000/api/name/name'; //scanner ile baglanti kurmak icin bunu kaldirin

    constructor(private http: HttpClient) { }

    getName(email: string){
        return this.http.get(`${this.apiUrl}?email=${encodeURIComponent(email)}`, {responseType: 'text'});
    }
}