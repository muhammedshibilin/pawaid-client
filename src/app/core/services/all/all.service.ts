import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AllService {
  private api = 'http://localhost:4040';

  constructor(private http: HttpClient) { }

  verifyEmail(email: string): Observable<any> {
    return this.http.post(`${this.api}/verify-Email`, { email });
  }

  registerGoogleUser(userData: { email: string; username: string }): Observable<any> {
    return this.http.post(`${this.api}/register-google`, userData);
  }

  findUser(userId: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const options = {
      headers,
      withCredentials: true
    };

    return this.http.post(`${this.api}/find-user`, { userId }, options).pipe(
      tap(response => console.log('Find user response:', response)),
      catchError(error => {
        console.error('Find user error:', error);
        return throwError(() => error);
      })
    );
  }

  
} 