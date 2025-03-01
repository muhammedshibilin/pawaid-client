import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../modules/user/components/services/auth.service';

export const preventAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    console.log('loginnna aan ')
    router.navigate(['/']); 
    return false;
  }

  return true;
};
