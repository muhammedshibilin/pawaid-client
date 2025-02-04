import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DonationOption {
  amount: number;
  label: string;
}

type DonationType = 'monthly' | 'one-time';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css']
})
export class DonateComponent implements OnInit {
  selectedAmount: number = 0;
  customAmount: number | null = null;
  donationType: DonationType = 'one-time';
  donationTypes: DonationType[] = ['one-time', 'monthly'];
  donorName: string = '';
  donorEmail: string = '';
  businessName: string = '';

  donationOptions: DonationOption[] = [
    { amount: 500, label: '₹500' },
    { amount: 1000, label: '₹1,000' },
    { amount: 2000, label: '₹2,000' },
    { amount: 5000, label: '₹5,000' }
  ];

  donorFields = [
    { type: 'text', placeholder: 'Your Name', value: '', icon: 'fas fa-user' },
    { type: 'email', placeholder: 'Email Address', value: '', icon: 'fas fa-envelope' },
    { type: 'text', placeholder: 'Business Name (Optional)', value: '', icon: 'fas fa-building' }
  ];

  trustIndicators = [
    { icon: 'fas fa-shield-alt', text: 'Secure Payment' },
    { icon: 'fas fa-hand-holding-heart', text: 'Tax Benefits' },
    { icon: 'fas fa-clock', text: '24/7 Support' }
  ];

  private hoverSound: HTMLAudioElement;
  private focusSound: HTMLAudioElement;

  dogGifUrl: string = 'https://tenor.com/view/cute-dog-puppy-smile-gif-15999912';
  dancingDogGifUrl: string = 'https://tenor.com/view/dog-dance-dancing-dog-gif-18865060';
  
  isDogDancing: boolean = false;

  @ViewChild('container') container!: ElementRef;
  private mouseTrail: HTMLDivElement[] = [];

  constructor() {
    this.hoverSound = new Audio('assets/sounds/hover.mp3');
    this.focusSound = new Audio('assets/sounds/focus.mp3');
  }

  ngOnInit() {
    this.initializeParticles();
    this.setupMouseTrail();
  }

  playHoverSound() {
    this.hoverSound.currentTime = 0;
    this.hoverSound.play();
  }

  playInputFocusSound() {
    this.focusSound.currentTime = 0;
    this.focusSound.play();
  }

  getDonationTypeClass(type: string): string {
    const baseClass = 'donation-type-button';
    return this.donationType === type 
      ? `${baseClass} active` 
      : baseClass;
  }

  getAmountButtonClass(amount: number): string {
    const baseClass = 'amount-button group';
    return this.selectedAmount === amount 
      ? `${baseClass} active` 
      : baseClass;
  }

  getCustomAmountClass(): string {
    return `custom-amount-input ${this.customAmount ? 'has-value' : ''}`;
  }

  getInputClass(): string {
    return 'form-input';
  }

  isFormValid(): boolean {
    return !!(this.getCurrentAmount() && this.donorName && this.donorEmail);
  }

  private initializeParticles() {
    // Initialize particle.js here
  }

  setDonationType(type: DonationType) {
    this.donationType = type;
  }

  selectAmount(amount: number) {
    this.selectedAmount = amount;
    this.customAmount = null;
  }

  setCustomAmount(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.customAmount = value ? Number(value) : null;
    this.selectedAmount = 0;
  }

  getCurrentAmount(): number {
    return this.customAmount || this.selectedAmount;
  }

  handleDonation() {
    const donationData = {
      amount: this.getCurrentAmount(),
      type: this.donationType,
      name: this.donorName,
      email: this.donorEmail,
      businessName: this.businessName
    };
    console.log('Processing donation:', donationData);
    // Implement payment gateway integration here
  }

  getCurrentDogGif(): string {
    return this.isDogDancing ? this.dancingDogGifUrl : this.dogGifUrl;
  }

  toggleDogDance() {
    this.isDogDancing = !this.isDogDancing;
    if (this.isDogDancing) {
      this.playHoverSound();
    }
  }

  getDonationTypeIcon(type: string): string {
    return type === 'monthly' ? 'fas fa-sync-alt' : 'fas fa-hand-holding-usd';
  }

  private setupMouseTrail() {
    document.addEventListener('mousemove', (e) => {
      const trail = document.createElement('div');
      trail.className = 'mouse-trail';
      trail.style.left = e.pageX - 10 + 'px';
      trail.style.top = e.pageY - 10 + 'px';
      document.body.appendChild(trail);

      setTimeout(() => {
        document.body.removeChild(trail);
      }, 1000);
    });
  }

  // Parallax Effect
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.container) return;

    const { clientX, clientY } = event;
    const { left, top, width, height } = this.container.nativeElement.getBoundingClientRect();
    
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;

    const elements = this.container.nativeElement.querySelectorAll('.parallax-layer');
    elements.forEach((el: HTMLElement, index: number) => {
      const speed = (index + 1) * 20;
      el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  }
}
