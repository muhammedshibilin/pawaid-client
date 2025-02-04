
import { Component, OnInit} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from './core/services/notification.service';
import { QuickBallComponent } from './components/base/quick-ball/quick-ball.component';
import { UploadComponent } from './components/user/upload/upload.component';
import { Observable } from 'rxjs';
import { UploadService } from './core/services/upload.service';




@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet,QuickBallComponent,CommonModule,UploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

   title = 'PawAid';
   isModalOpen$: Observable<boolean>;

   hideQuickBall = false;
   excludedRoutes = ['/login', '/register', '/otp', '/reset-password','/verify-email','/404'];
 
   constructor(private notificationService: NotificationService,private modalService:UploadService,private router:Router){
    this.isModalOpen$ = this.modalService.isModalOpen$
    this.router.events.subscribe(() => {
      this.hideQuickBall = this.excludedRoutes.includes(this.router.url);
    });
   } 
   

   ngOnInit() {
      this.notificationService.listenForMessages(); 
    }

    showUploadModal(){
      this.modalService.openModal()
    }

    hideUploadModal(){
      this.modalService.closeModal()
    }

  }


