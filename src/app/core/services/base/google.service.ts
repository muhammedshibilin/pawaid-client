import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth, signInWithPopup, GoogleAuthProvider, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AllModulesService } from './all-modules.service';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

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
  providedIn: 'root',
})
export class GoogleService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();
  private api = 'http://localhost:4040';

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private router: Router,
    private allService: AllModulesService,
    private toastService: ToastrService
  ) {}

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
  
      const user = result.user;
      this.userSubject.next(user);
  
      const userData = {
        email: user.email!,
        username: user.displayName!,
      };
  
      try {
        const verifyResponse = await firstValueFrom(
          this.allService.verifyEmail(userData.email)
        );
  
        this.handleSuccessfulAuth(verifyResponse);
  
      } catch (error: any) {
        if (error.status === 404) {
          console.log('User not found, proceeding with registration...');
          const registerResponse = await firstValueFrom(
            this.allService.registerGoogleUser(userData)
          );
          this.handleSuccessfulAuth(registerResponse);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      this.toastService.error('Authentication failed. Please try again.', 'Error');
    }
  }

  private handleSuccessfulAuth(response: GoogleAuthResponse) {
    console.log('Auth response:', response);

    if (response.data && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      console.log('Access token stored:', response.data.accessToken);
    } else {
      console.warn('No access token in response');
    }
    const toast = this.toastService.success(
      response.message || 'Successfully authenticated',
      'Success',
      { timeOut: 2000, progressBar: true }
    );

    toast.onHidden.subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
