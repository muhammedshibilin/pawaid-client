import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtHelper = inject(JwtHelperService);

  const accessToken = localStorage.getItem('accessToken');
  console.log('Starting interceptor check');
  console.log('Current URL:', req.url);
  console.log('Current access token:', accessToken ? 'exists' : 'none');

  const excludeUrls = ['/refresh-token','/find-user'];

  if (excludeUrls.some((url) => req.url.includes(url))) {
    console.log('Skipping interceptor for:', req.url);
    return next(req);
  }

  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = payload.userId || payload.id;
      console.log('User ID:', userId);

      const isTokenExpired = jwtHelper.isTokenExpired(accessToken);
      console.log('Is token expired?', isTokenExpired);

      if (!isTokenExpired) {
        console.log('Token valid, proceeding with request');
        const clonedRequest = req.clone({
          setHeaders: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true
        });
        return next(clonedRequest);
      } else {
        console.log('Token expired, attempting refresh');
        return refreshTokenRequest().pipe(
          switchMap((newAccessToken) => {
            console.log('Got new access token:', newAccessToken ? 'success' : 'failed');
            if (newAccessToken) {
              localStorage.setItem('accessToken', newAccessToken);
              const newClonedRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${newAccessToken}` },
                withCredentials: true
              });
              return next(newClonedRequest);
            }
            throw new Error('Failed to get new access token');
          }),
          catchError((error) => {
            console.error('Refresh token error:', error);
            localStorage.removeItem('accessToken');
            return throwError(() => error);
          })
        );
      }
    } catch (error) {
      console.error('Error processing token:', error);
      return throwError(() => error);
    }
  }

  console.log('No token found, proceeding without authentication');
  return next(req);
};

function refreshTokenRequest(): Observable<string> {
  const userService = inject(UserService);
  console.log('Called to backend for refresh token');
  return userService.requestAccessToken().pipe(
    map((response: any) => {
      console.log('Refresh token response:', response);
      return response.accessToken;
    }),
    catchError(error => {
      console.error('Refresh token request failed:', error);
      return throwError(() => error);
    })
  );
}
