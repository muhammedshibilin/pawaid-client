
import { Component, OnInit} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from './core/services/notification.service';
import { QuickBallComponent } from './components/base/quick-ball/quick-ball.component';
import { UploadComponent } from './components/user/upload/upload.component';
import { filter, Observable } from 'rxjs';
import { UploadService } from './core/services/upload.service';
import { AuthService } from './core/services/auth.service';




@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet,QuickBallComponent,UploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

   title = 'PawAid';
   isModalOpen$!: Observable<boolean>;

   hideQuickBall:Boolean = true
   excludedRoutes = ['/login', '/register', '/otp', '/reset-password','/verify-email','/404'];
 
   constructor(private notificationService: NotificationService,private modalService:UploadService,private router:Router,private authService:AuthService){
    this.isModalOpen$ = this.modalService.isModalOpen$

   
   } 
   

   ngOnInit() {
      this.notificationService.listenForMessages(); 
      if (this.authService.getRole() === 'user') {
        this.hideQuickBall = false;
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
          this.hideQuickBall = this.excludedRoutes.includes(this.router.url);
        });
      }
      if (this.authService.getRole()==='recruiter'&&navigator.geolocation) {
        if (this.authService.getRole()==='recruiter'&&navigator.geolocation) {
          navigator.geolocation.watchPosition(
            (position) => {
              console.log('Current Position:of recruiter', position);
            },
            (error) => {
              console.error('Error tracking location:', error);
            }
          );
        } else {
          console.log('Geolocation is not supported by this browser.');
        }
    
      } else {
        console.log('Geolocation is not supported by this browser.');
      }
  
  
    }

    showUploadModal(){
      this.modalService.openModal()
    }

    hideUploadModal(){
      this.modalService.closeModal()
    }

  }


