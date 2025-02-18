import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports:[CommonModule,FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  token: string | null = null;
  userRole: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      try {
        const decodedToken = this.jwtHelper.decodeToken(this.token);
        this.userRole = decodedToken?.role;

        console.log('Decoded Token:', decodedToken);
        console.log('User Role:', this.userRole);
      } catch (error) {
        this.toastr.error('Invalid token.');
        this.router.navigate(['/login']);
      }
    } else {
      this.toastr.error('No token provided. request for another one');
      this.router.navigate(['/login']);
    }
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    if (!this.token) {
      this.toastr.error('Token missing. Try again.');
      return;
    }

    this.isLoading = true;
  
    const payload = {
      token: this.token,
      newPassword: this.newPassword,
    };

  
    let apiUrl =`${environment.api}`;
 
    if (this.userRole === 'doctor') {
      apiUrl = `${apiUrl}/doctor/reset-password`;
    } else if (this.userRole === 'recruiter') {
      apiUrl = `${apiUrl}/recruiter/reset-password`
    }else if (this.userRole === 'user'){
      apiUrl = `${apiUrl}/reset-password`
    }

 
    this.http.post(apiUrl, payload).subscribe({
      next: (response) => {
        this.toastr.success('Password reset successfully!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to reset password');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
