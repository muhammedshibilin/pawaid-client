import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, enableProdMode } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OtpService } from '../../../core/services/otp.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
})
export class OtpComponent implements AfterViewInit {
  otpForm!: NonNullable<FormGroup>;
  timeLeft = 60;
  timerInterval: any;
  private destroy$ = new Subject<void>();

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(private fb: FormBuilder,private otpService: OtpService, private router: Router,private toast:ToastrService) {}

  ngOnInit() {
    this.initForm();
    this.startTimer();
  }

  ngAfterViewInit() {
    console.log(this.otpInputs)
  }

  initForm() {
    const formControls: { [key: string]: any } = {};
    for (let i = 0; i < 6; i++) {
      formControls[`digit${i}`] = ['', [Validators.required, Validators.pattern(/^[0-9]$/)]];
    }
    this.otpForm = this.fb.group(formControls, { validators: this.validateOTP });
  }

  validateOTP(form: FormGroup) {
    const digits = Object.keys(form.controls)
      .filter((key) => key.startsWith('digit'))
      .map((key) => form.get(key)?.value);

    const isComplete = digits.every((digit) => digit !== '');
    return isComplete ? null : { incomplete: true };
  }

  onDigitInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
  
    if (!/^[0-9]$/.test(value)) {
      this.otpForm.get(`digit${index}`)?.setValue(''); 
      return;
    }
  
    if (value.length === 1 && index < 5) {
      const nextInput = this.otpInputs.get(index + 1)?.nativeElement;
      if (nextInput) {
        nextInput.focus(); 
        nextInput.select(); 
      }
    }
  }
  
  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      const currentValue = this.otpForm.get(`digit${index}`)?.value;
        if (currentValue === '') {
        const prevInput = this.otpInputs.get(index - 1)?.nativeElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
            const prevInput = this.otpInputs.get(index - 1)?.nativeElement;
      if (prevInput) {
        prevInput.focus();
      }
    } else if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = this.otpInputs.get(index + 1)?.nativeElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onSubmit() {
    if (this.otpForm.valid) {
      const otp = Object.keys(this.otpForm.controls)
        .filter((key) => key.startsWith('digit'))
        .map((key) => this.otpForm.get(key)?.value)
        .join('');

      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('User ID not found. Please register again.');
        return;
      }

      this.otpService.verifyOtp(userId, otp).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          console.log('OTP verified successfully:', response,response.data);
          localStorage.setItem('accessToken',response.data)
          this.toast.success(response.message,'success')
          this.router.navigate(['/'])
        },
        error: (error: HttpErrorResponse) => {
          const errorMsg = error.error?.message || error.message || 'An error occurred';
          this.toast.error(errorMsg,'error')
        },
      });
    }
  }

  startTimer() {
    const savedTime = localStorage.getItem('otpTimer');
    const now = Math.floor(Date.now() / 1000);
    
    if (savedTime && +savedTime > now) {
      this.timeLeft = +savedTime - now;
    } else {
      this.timeLeft = 60; 
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1;
      } else {
        clearInterval(this.timerInterval); 
      }
      localStorage.setItem('otpTimer', (Math.floor(Date.now() / 1000) + this.timeLeft).toString()); 
    }, 1000);
  }

  resendOTP() {
    this.timeLeft = 60; 
    this.startTimer()
    localStorage.setItem('otpTimer', (Math.floor(Date.now() / 1000) + this.timeLeft).toString());
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error('User ID not found. Please register again.');
      return;
    }

    this.otpService.resendOtp(userId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log('OTP resent successfully');
        this.startTimer(); 
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error resending OTP:', error.message);
      },
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}