import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminDoctorService {
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

  getDoctors(): Observable<any> {
    return this.http.get(`${this.api}/doctors`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(response => console.log('Doctors response:', response)),
      catchError(error => {
        console.error('Error fetching doctors:', error);
        return throwError(() => error);
      })
    );
  }

  toggleBlockStatus(doctorId: string, isBlocked: boolean): Observable<any> {
    console.log('hidii doctoor blok in frontenddd')
    return this.http.patch(
      `${this.api}/block-doctor/${doctorId}`,
      { is_block: isBlocked },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }
  
}
