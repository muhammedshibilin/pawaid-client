
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-showcase.component.html',
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .float {
      animation: float 3s ease-in-out infinite;
    }
    .service-card:hover {
      transform: translateY(-5px);
      transition: transform 0.3s ease;
    }
  `]
})
export class ServiceShowcaseComponent {
  services = [
    {
      icon: 'fas fa-stethoscope',
      title: 'Veterinary Care',
      description: 'Professional medical care for your pets with state-of-the-art facilities and experienced veterinarians.'
    },
    {
      icon: 'fas fa-home',
      title: 'Pet Adoption',
      description: 'Find your perfect companion from our network of shelters and rescue organizations.'
    },
    {
      icon: 'fas fa-heart',
      title: 'Emergency Care',
      description: '24/7 emergency services to ensure your pet receives immediate attention when needed.'
    },
    {
      icon: 'fas fa-bone',
      title: 'Pet Training',
      description: 'Expert training programs to help your pet develop good behavior and social skills.'
    },
    {
      icon: 'fas fa-cut',
      title: 'Grooming',
      description: 'Professional grooming services to keep your pet clean, healthy, and looking their best.'
    },
    {
      icon: 'fas fa-paw',
      title: 'Pet Boarding',
      description: 'Safe and comfortable boarding facilities when you need to leave your pet in caring hands.'
    }
  ];
} 
