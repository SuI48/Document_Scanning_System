import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private role: string = '';
  private email: string = '';

  constructor(private http: HttpClient) {
    this.loggedIn = !!localStorage.getItem('userToken');
    this.role = localStorage.getItem('userRole') || '';
    this.email = localStorage.getItem('userEmail') || '';
  }

  private apiUrl = 'http://localhost:5000/api/login/login';

  login(email: string, password: string): Observable<string> {
    return this.http.post(this.apiUrl, { email, password }, { responseType: 'text' })
      .pipe(
        tap((role: string) => {
          if (role) {
            this.setUserRole(role);
            this.setLoggedIn(true);
            this.setEmail(email);
            localStorage.setItem('userToken', 'dummyToken'); // Gerçek token yerine dummyToken kullanıyoruz
            localStorage.setItem('userRole', role);
            localStorage.setItem('userEmail', email);
            return of(true);
          } else {
            this.setLoggedIn(false);
            return of(false);
          }
        })
      );
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  setLoggedIn(loggedIn : boolean): void {
    this.loggedIn = loggedIn;
  }

  getUserRole(): string {
    return this.role;
  }

  setUserRole(role: string){
    this.role = role;
  }

  logout(): void {
    this.loggedIn = false;
    this.role = '';
    this.email = '';
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    console.log('User logged out');
  }

  setEmail(email: string){
    this.email = email;
  }

  getEmail(): string {
    return this.email;
  }
}
