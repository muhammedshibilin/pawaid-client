import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../../core/services/admin/admin.service';
import { DoctorService } from '../../../core/services/doctor/doctor.service';
import { RecruiterService } from '../../../core/services/recruiter/recruiter.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faUser, 
  faUserShield, 
  faUserMd, 
  faUserTie, 
  faPaw, 
  faKey, 
  faSignInAlt, 
  faEye, 
  faEyeSlash,
  faUserCircle,
  faCheckCircle,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { NotificationService } from '../../../core/services/notification.service';
import { GoogleService } from '../../../core/services/all/google.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AppComponent } from '../../../app.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    FontAwesomeModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  user: any = null;
  showPassword = false;
  selectedUserType = 'User';
  userTypes = ['User', 'Admin', 'Doctor', 'Recruiter'];

  faUser = faUser;
  faUserShield = faUserShield;
  faUserMd = faUserMd;
  faUserTie = faUserTie;
  faPaw = faPaw;
  faKey = faKey;
  faSignInAlt = faSignInAlt;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faUserCircle = faUserCircle;
  faCheckCircle = faCheckCircle;
  faShieldAlt = faShieldAlt;
  faGoogle = faGoogle

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private googleService: GoogleService,
    private adminService: AdminService,
    private doctorService: DoctorService,
    private recruiterService: RecruiterService,
    private notificationService:NotificationService,
    private toastr: ToastrService,
    private jwtHelper:JwtHelperService,
    private appComponent:AppComponent
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.googleService.user$.subscribe((user) => (this.user = user));
  }

  getUserTypeIcon(type: string) {
    const icons = {
      'User': this.faUser,
      'Admin': this.faUserShield,
      'Doctor': this.faUserMd,
      'Recruiter': this.faUserTie
    };
    return icons[type as keyof typeof icons] || this.faUser;
  }

  selectUserType(type: string): void {
    this.selectedUserType = type;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  signInWithGoogle() {
    this.googleService.signInWithGoogle()
      .then(() => {})
      .catch((error) => {
        console.error('Sign-in error:', error);
        this.toastr.error('Google sign-in failed. Please try again.', 'Error');
      });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = { ...this.loginForm.value };

      const loginObserver = {
        next: (response: any) => {
          if (response.status == 201) {
              const toast = this.toastr.error(response.message, 'error', {
              timeOut: 2000,
              progressBar: true
            });
            toast.onHidden.subscribe(() => {
              localStorage.setItem('user_id', response.data._id)
              this.router.navigate(['/otp'])
            })
            return
          }
          if(response.status == 404){
            const toast = this.toastr.error(response.message, 'error', {
              timeOut: 2000,
              progressBar: true
            });
            return
          }
          this.notificationService.requestPermission()
          console.log('responseseef ',response,this.jwtHelper.decodeToken(response.data))
          localStorage.setItem('accessToken', response.data);
          localStorage.setItem('userType', this.selectedUserType.toLowerCase());
          const toast = this.toastr.success(response.message, 'Success', {
            timeOut: 2000,
            progressBar: true
          });
          toast.onHidden.subscribe(() => {
            this.router.navigate([this.getRedirectPath()]);
          });
        },
        error: (error: any) => {
          console.error('Login Failed', error);
          const errorMessage = error.error?.message || 'Login failed. Please try again.';
          this.toastr.error(errorMessage, 'Error');
        },
      };

      switch (this.selectedUserType) {
        case 'User':
          this.userService.login(loginData).subscribe(loginObserver);
          break;
        case 'Admin':
          this.adminService.login(loginData).subscribe(loginObserver);
          break;
        case 'Doctor':
          this.doctorService.login(loginData).subscribe(loginObserver);
          break;
        case 'Recruiter':
          this.recruiterService.login(loginData).subscribe(loginObserver);
          break;
        default:
          this.toastr.warning('Please select a valid user type.', 'Warning');
      }
    }
  }

  getRedirectPath(): string {
    const userType = this.selectedUserType.toLowerCase();
    switch (userType) {
      case 'user': return '/';
      case 'admin': return '/admin/dashboard';
      case 'doctor': return '/';
      case 'recruiter': return '/';
      default: return '/';
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register'])
  }

  navigateToVerifyEmail() {
    this.router.navigate(['/verify-email']);
  }
}