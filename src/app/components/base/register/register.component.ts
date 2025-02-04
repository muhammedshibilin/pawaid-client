import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { DoctorService } from '../../../core/services/doctor/doctor.service';
import { RecruiterService } from '../../../core/services/recruiter/recruiter.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm!: FormGroup;
  isSubmitted = false;
  showPassword = false;
  showConfirmPassword = false;
  isSpecialUser = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toast: ToastrService,
    private doctorService: DoctorService,
    private recruiterService: RecruiterService
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.fb.group({
      userType: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      document: [null],
      password: [''],
      confirmPassword: [''],
    });

    this.registerForm.get('userType')?.valueChanges.subscribe((value) => {
      this.isSpecialUser = value === 'doctor' || value === 'recruiter';
      if (this.isSpecialUser !== this.isSpecialUser) { 
        this.isSpecialUser = this.isSpecialUser;
        this.updateFormValidation();
      }
    });
  }

  private updateFormValidation() {
    if (this.isSpecialUser) {
      this.registerForm.get('document')?.setValidators([Validators.required]);
      this.registerForm.get('password')?.clearValidators();
      this.registerForm.get('confirmPassword')?.clearValidators();
    } else {
      this.registerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.registerForm.get('confirmPassword')?.setValidators([Validators.required]);
      this.registerForm.get('document')?.clearValidators();
    }

    Object.keys(this.registerForm.controls).forEach((key) => {
      this.registerForm.get(key)?.updateValueAndValidity();
    });
  }

  selectedFile: File | null = null;

onFileSelect(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  console.log('Selected file:', file);
  
  if (file) {
    this.selectedFile = file;  
    this.registerForm.patchValue({
      document: file
    });
    this.registerForm.get('document')?.updateValueAndValidity();
    console.log('File stored in form:', this.registerForm.get('document')?.value);
  }
}

  togglePassword(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.registerForm.invalid) {
      return;
    }
  
    if (this.isSpecialUser) {
      const formData = new FormData();
      const formValue = this.registerForm.value;
      
      formData.append('username', formValue.username);
      formData.append('email', formValue.email);
      formData.append('phone', formValue.phone);
      formData.append('userType', formValue.userType);

      
      
      const documentFile = this.registerForm.get('document')?.value;
      if (documentFile) {
        formData.append('document', documentFile);
      }
  

      console.log('formdaa in component',formData)
      if (formValue.userType === 'doctor') {
        this.doctorService.register(formData).subscribe({
          next: (response) => {
            this.toast.success('Registration request submitted for approval', 'Success');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            this.toast.error(error.error.message || 'Registration failed', 'Error');
          },
        });
      } else if (formValue.userType === 'recruiter') {
        this.recruiterService.register(formData).subscribe({
          next: (response) => {
            this.toast.success('Registration request submitted for approval', 'Success');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            this.toast.error(error.error.message || 'Registration failed', 'Error');
          },
        });
      }
    } else {
      const { username, email, phone, password } = this.registerForm.value;
      this.userService.register({ username, email, phone, password }).subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.toast.success(response.message, 'Success');
            localStorage.setItem('user_id', response.data._id);
            this.router.navigate(['/otp']);
          }
        },
        error: (error) => {
          this.toast.error(error.error.message || 'Registration failed', 'Error');
        },
      });
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  selectUserType(type: 'user' | 'doctor' | 'recruiter') {
    this.registerForm.patchValue({ userType: type });
  }

  getUserTypeDescription(): string {
    switch (this.registerForm.get('userType')?.value) {
      case 'doctor':
        return 'Register as a veterinary professional to provide medical services';
      case 'recruiter':
        return 'Register as a recruiter to post job opportunities';
      case 'user':
        return 'Register as a user';
      default:
        return 'Select your registration type to continue';
    }
  }
}
