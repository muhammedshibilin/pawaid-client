import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feature-highlight',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-highlight.component.html',
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .feature-icon:hover {
      animation: float 3s ease-in-out infinite;
    }
    .stat-card {
      transition: all 0.3s ease;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class FeatureHighlightComponent {
  features = [
    {
      icon: 'fas fa-user-md',
      title: 'Expert Veterinarians',
      description: 'Our team of experienced veterinarians provides the highest quality care for your pets.'
    },
    {
      icon: 'fas fa-clock',
      title: '24/7 Availability',
      description: 'Round-the-clock emergency services to ensure your pet\'s well-being at all times.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Safe Environment',
      description: 'State-of-the-art facilities designed with your pet\'s safety and comfort in mind.'
    },
    {
      icon: 'fas fa-hand-holding-heart',
      title: 'Compassionate Care',
      description: 'We treat every pet with the love and attention they deserve.'
    },
    {
      icon: 'fas fa-comments',
      title: 'Easy Communication',
      description: 'Stay connected with our team through our modern communication channels.'
    },
    {
      icon: 'fas fa-certificate',
      title: 'Certified Services',
      description: 'All our services meet the highest industry standards and certifications.'
    }
  ];

  stats = [
    { value: '10K+', label: 'Pets Helped' },
    { value: '500+', label: 'Expert Veterinarians' },
    { value: '100%', label: 'Satisfaction Rate' }
  ];
} 