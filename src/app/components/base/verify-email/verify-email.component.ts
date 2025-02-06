import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AllService } from '../../../core/services/all/all.service';

@Component({
  selector: 'app-verify-email',
  imports:[FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnDestroy {
  emailForm: FormGroup;
  private unsubscribe$ = new Subject<void>();

  constructor(private fb: FormBuilder, private emailService:AllService,private router:Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.emailForm.valid) {
      const email = this.emailForm.value.email;
      console.log('eamil',email)
      this.emailService.verifyEmail(email)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (response) => {
            console.log(response,'shihi')
            console.log('Password reset email sent:', response);
            this.router.navigate(['login'])
          },
          error: (err) => {
            console.error('Error sending password reset request:', err);
          },
          complete: () => {
            console.log('Password reset process complete');
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
