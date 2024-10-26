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
export class UserService {
  private apiUrl = 'http://localhost:5000/api/User'; // Your API base URL

  constructor(private http: HttpClient) {}

  deleteUser(userId: number, currentUserEmail: string): Observable<void> {
    const url = `http://localhost:5000/api/User/deleteUser/${userId}`;
    const headers = new HttpHeaders().set('currentUserEmail', currentUserEmail);
  
    return this.http.post<void>(url, {}, { headers });
  }

  updateUser(user: CommonUser, currentUserEmail: string): Observable<boolean> {
    const url = `${this.apiUrl}/updateUser`;
    const headers = new HttpHeaders().set('currentUserEmail', currentUserEmail);

    return this.http.post<boolean>(url, user, { headers });
  }
}