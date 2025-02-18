import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  socialLinks = [
    { icon: 'fab fa-facebook', url: '#', label: 'Facebook' },
    { icon: 'fab fa-twitter', url: '#', label: 'Twitter' },
    { icon: 'fab fa-instagram', url: '#', label: 'Instagram' },
    { icon: 'fab fa-linkedin', url: '#', label: 'LinkedIn' }
  ];

  quickLinks = [
    { label: 'About Us', route: '/about' },
    { label: 'Services', route: '/services' },
    { label: 'Contact', route: '/contact' },
    { label: 'Blog', route: '/blog' }
  ];

  services = [
    'Pet Care',
    'Veterinary Services',
    'Pet Adoption',
    'Emergency Care',
    'Pet Training'
  ];
}
