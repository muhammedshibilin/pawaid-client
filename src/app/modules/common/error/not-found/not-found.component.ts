import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div class="max-w-2xl w-full text-center">
        <div class="mb-8 relative">
          <div class="text-[150px] font-bold text-emerald-200 leading-none select-none">404</div>
          <img src="assets/user/255-2550411_404-error-images-free-png-transparent-png.webp" alt="404" class="w-64 h-64 mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"/>
        </div>

        <h1 class="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p class="text-gray-600 mb-8">Oops! The page you're looking for doesn't exist or has been moved.</p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            (click)="goBack()" 
            class="px-6 py-3 bg-white text-emerald-600 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-all duration-300 flex items-center justify-center gap-2 group">
            <i class="fas fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
            Go Back
          </button>
          <button 
            (click)="goHome()" 
            class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2 group">
            <i class="fas fa-home"></i>
            Return Home
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


export class NotFoundComponent {
  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }

  goHome() {
    this.router.navigate(['/']);
  }
} 