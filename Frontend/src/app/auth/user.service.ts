import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/account/changepassword';  // Corrected URL

  constructor(private http: HttpClient) {}

  // Implement the getUserEmail method
  getUserEmail(): string {
    return localStorage.getItem('userEmail') || '';  // Assuming the email is stored in localStorage
  }

  changePassword(email: string, oldPassword: string, newPassword: string, confirmNewPassword: string): Observable<any> {
    const body = {
      email: email,
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmNewPassword: confirmNewPassword
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Corrected the URL by removing the extra /changepassword
    return this.http.post(`${this.apiUrl}`, body, { headers, responseType: 'text' })
      .pipe(
        catchError(this.handleError)  // Handle errors
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);  // Log the error
    return throwError(error);  // Return an observable with an error
  }
}

