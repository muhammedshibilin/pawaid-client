import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxStripeModule, StripeCardCvcComponent, StripeCardExpiryComponent, StripeCardNumberComponent, StripeService } from 'ngx-stripe';
import { PaymentIntent, StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StripeCardNumberComponent,
    StripeCardExpiryComponent,
    StripeCardCvcComponent,
    NgxStripeModule,
  ],
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.css'],
})
export class StripePaymentComponent {
  @ViewChild(StripeCardNumberComponent) card!: StripeCardNumberComponent;

  public cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        fontWeight: '400',
        fontFamily: 'Circular',
        fontSize: '14px',
        iconColor: '#666EE8',
        color: '#002333',
        '::placeholder': {
          color: '#919191',
        },
      },
    },
  };

  public elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private stripeService: StripeService
  ) {}

  paymentForm!: FormGroup;

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      amount: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });
  }

  pay(): void {
    if (this.paymentForm.valid) {
      if (!this.card || !this.card.element) {
        console.error('Stripe card element is not initialized.');
        return;
      }

      this.createPaymentIntent(Number(this.paymentForm.get('amount')?.value))
        .pipe(
          switchMap((pi) =>{
            if (!pi.client_secret) {
              throw new Error('Client secret is missing.');
            }
return this.stripeService.confirmCardPayment(pi.client_secret, {
  payment_method: {
    card: this.card.element,
    billing_details: {
      name: this.paymentForm.get('name')?.value,
      email: this.paymentForm.get('email')?.value,
    },
  },
})
          }
            
          )
        )
        .subscribe((result) => {
          if (result.error) {
            console.log(result.error.message);
          } else {
            if (result.paymentIntent.status === 'succeeded') {
              console.log('Payment successful!');
            }
          }
        });
    } else {
      console.log('Invalid form', this.paymentForm);
    }
  }

  createPaymentIntent(amount: number): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(
      `${environment.api}/create-payment-intent`,
      { amount }
    );
  }
}
