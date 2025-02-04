import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class adminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
   
    const admin = this.authService.getRole();
    console.log('Admin guard triggered',admin);
    if (admin === 'admin') {
      return true;
    } else {
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }
}