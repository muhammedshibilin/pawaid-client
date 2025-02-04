import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface GoogleAuthResponse {
  status: number;
  message: string;
  error: string | null;
  data: {
    user: boolean;
    accessToken: string;
    refreshToken?: string;
    userData?: {
      email: string;
      username: string;
      _id: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AllModulesService {
  private api = 'http://localhost:4040';

  constructor(private http: HttpClient) {}

  verifyEmail(email: string): Observable<GoogleAuthResponse> {
    return this.http.post<GoogleAuthResponse>(
      `${this.api}/verifyGoogleEmail`,
      { email },
      { withCredentials: true }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => ({
            status: 404,
            message: 'User not found',
            error: null,
            data: null
          }));
        }
        return throwError(() => error);
      })
    );
  }

  registerGoogleUser(userData: { email: string; username: string }): Observable<GoogleAuthResponse> {
    return this.http.post<GoogleAuthResponse>(
      `${this.api}/register-google-user`,
      userData,
      { withCredentials: true }
    );
  }

  
}
