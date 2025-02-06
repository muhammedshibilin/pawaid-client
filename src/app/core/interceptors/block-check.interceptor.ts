import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, catchError, throwError, of, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { AllService } from '../services/all/all.service';

export const blockCheckInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>, 
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  
  const skipUrls = [
    '/find-user',
    '/login',
    '/register',
    '/refresh-token'
  ];

  if (skipUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  console.log('Block check interceptor triggered for URL:', req.url);
  
  const jwtHelper = inject(JwtHelperService);
  const allService = inject(AllService);
  const router = inject(Router);
  const toastService = inject(ToastrService);

  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken || jwtHelper.isTokenExpired(accessToken)) {
    console.log('No valid token, skipping block check');
    return next(req);
  }

  try {
    const payload = jwtHelper.decodeToken(accessToken);
    const userId = payload?.id || payload?.userId;

    if (!userId) {
      return next(req);
    }

    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
    });

    return allService.findUser(userId).pipe(
      switchMap((response) => {
        if (response?.user?.is_block) {
          localStorage.removeItem('accessToken');
          toastService.error('Account blocked. Contact support.', 'Blocked');
          router.navigate(['/login']);
          return throwError(() => new Error('User is blocked'));
        }
        return next(authReq);
      }),
      catchError((error) => {
        console.error('Block check error:', error);
        if (error.status === 403) {
          localStorage.removeItem('accessToken');
          toastService.error('Account blocked. Contact support.', 'Blocked');
          router.navigate(['/login']);
          return throwError(() => error);
        }
        return next(authReq);
      })
    );
  } catch (error) {
    console.error('Error in block check interceptor:', error);
    return next(req);
  }
};
