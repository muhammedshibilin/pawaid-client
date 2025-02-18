import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private jwtHelper: JwtHelperService) {
    console.log("JwtHelperService instance:", jwtHelper);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getRole(): string | null {
    const token = localStorage.getItem('accessToken');
    console.log('token in get role', token)
    if (token) {
      try {
        const decodedToken = this.jwtHelper.decodeToken(token);
        return decodedToken?.role;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  }

  getId():string|null{
    const token = localStorage.getItem('accessToken')
    if(token){
      try {
        const decodedId = this.jwtHelper.decodeToken(token)
        return decodedId?.id
      } catch (error) {
        console.log('error in decodeing token')
        return null
      }
    }
    return null
  }

}