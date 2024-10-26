import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../user.model';

@Injectable({
  providedIn: 'root'
})
export class UserAddService {
    private apiUrl = 'http://localhost:5000/api/useradd/useradd';  // Kullanıcı eklemek için API URL

    constructor(private http: HttpClient) { }
    
    add_user(user: User): Observable<boolean> {
      return this.http.post<boolean>(this.apiUrl, user);  // Kullanıcı ekleme API çağrısı
    }
}
