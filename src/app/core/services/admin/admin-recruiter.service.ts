import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminRecruiterService {

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
  
    getRecruiters(): Observable<any> {
      return this.http.get(`${this.api}/recruiters`, {
        headers: this.getHeaders(),
        withCredentials: true
      }).pipe(
        tap(response => console.log('recruiters response:', response)),
        catchError(error => {
          console.error('Error fetching users:', error);
          return throwError(() => error);
        })
      );
    }

    toggleBlockStatus(recruiterId: string, isBlocked: boolean): Observable<any> {
      return this.http.patch(
        `${this.api}/block-recruiter/${recruiterId}`,
        { is_block: isBlocked },
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      );
    }
    
}
