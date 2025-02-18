import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div class="max-w-2xl w-full text-center">
        <!-- Error Illustration -->
        <div class="mb-8 relative">
          <div class="text-[150px] font-bold text-red-200 leading-none select-none">403</div>
          <img src="assets/error/403.png" alt="403" class="w-64 h-64 mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"/>
        </div>

        <!-- Error Message -->
        <h1 class="text-4xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p class="text-gray-600 mb-8">Sorry! You don't have permission to access this page.</p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            (click)="goBack()" 
            class="px-6 py-3 bg-white text-red-600 rounded-xl border border-red-200 hover:bg-red-50 transition-all duration-300 flex items-center justify-center gap-2 group">
            <i class="fas fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
            Go Back
          </button>
          <button 
            (click)="goToLogin()" 
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2">
            <i class="fas fa-sign-in-alt"></i>
            Login
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    img {
      animation: float 3s ease-in-out infinite;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
} 