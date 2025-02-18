import { Component, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { faHome, faEnvelope, faUser, faHandHoldingHeart } from '@fortawesome/free-solid-svg-icons';
import { RouterModule} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule,FontAwesomeModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  logoPath = 'assets/user/images/logo.png';
  currentRoute: string = '';
  isNavbarVisible = false;
  hideTimeout: any;
  
  faHome = faHome;
  faEnvelope = faEnvelope;
  faUser = faUser;
  faHandHoldingHeart = faHandHoldingHeart;
  
  navbarItems = [
    { icon: this.faHome, text: 'Home', link: '/' },
    { icon: this.faEnvelope, text: 'Messages', link: '/messages' },
    { icon: this.faUser, text: 'Profile', link: '/profile' },
    { icon: this.faHandHoldingHeart, text: 'Donate', link: '/donate' },
  ];


  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const windowHeight = window.innerHeight;
    const threshold = windowHeight - 100;
    
    if (event.clientY > threshold) {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.isNavbarVisible = true;
    } else {
      if (!this.hideTimeout) {
        this.hideTimeout = setTimeout(() => {
          this.isNavbarVisible = false;
          this.hideTimeout = null;
        }, 1000); 
      }
    }
  }


  shouldShowItem(item: any): boolean {
    if (item.text === 'Home' && this.currentRoute === '/') {
      return false;
    }
    if (item.text === 'Profile' && this.currentRoute === '/profile') {
      return false;
    }
    if(item.text === 'Donate' && this.currentRoute === '/donate') {
      return false;
    }
    return true;
  }
}