import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-happy-pets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './happy-pets.component.html',
  styles: [`
    .image-container img {
      transition: transform 0.5s ease;
    }
    .image-container:hover img {
      transform: scale(1.05);
    }
  `]
})
export class HappyPetsComponent {
  stats = [
    { value: '2000+', label: 'Pets Helped' },
    { value: '500+', label: 'Happy Families' },
    { value: '100%', label: 'Satisfaction' }
  ];
} 