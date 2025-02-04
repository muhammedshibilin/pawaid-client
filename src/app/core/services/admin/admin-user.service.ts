import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User } from '../../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private api = 'http://localhost:4040/admin';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.api}/users`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(response => console.log('Users response:', response)),
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => error);
      })
    );
  }

  toggleBlockStatus(userId: string, isBlocked: boolean): Observable<any> {
    return this.http.patch(
      `${this.api}/block-user/${userId}`,
      { is_block: isBlocked },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }
}
