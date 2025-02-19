import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { NotificationService } from './core/services/notification.service';
import { UploadService } from './core/services/upload.service';
import { AuthService } from './modules/user/components/services/auth.service';
import { io } from 'socket.io-client';
import { environment } from '../environments/environment.development';
import { CommonModule } from '@angular/common';
import { QuickBallComponent } from './modules/user/components/quick-ball/quick-ball.component';
import { UploadComponent } from './modules/user/components/upload/upload.component';

interface Location {
  latitude: number;
  longitude: number;
  recruiterId?: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, QuickBallComponent, UploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'PawAid';
  isModalOpen$!: Observable<boolean>;
  private socket = io(environment.api);
  locationData: Location | null = null;
  private lastLocation: Location | null = null;
  private readonly MIN_DISTANCE = 0.001; 
  private readonly UPDATE_INTERVAL = 3000; 
  private locationUpdateInterval: any;

  hideQuickBall: Boolean = true;
  excludedRoutes = ['/login', '/register', '/otp', '/reset-password', '/verify-email', '/404'];

  constructor(
    private notificationService: NotificationService,
    private modalService: UploadService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isModalOpen$ = this.modalService.isModalOpen$;
  }

  ngOnInit() {
    this.notificationService.listenForMessages();
    this.setupQuickBallVisibility();
    this.initializeLocationTracking();
  }

  private setupQuickBallVisibility() {
    if (this.authService.getRole() === 'user') {
      this.hideQuickBall = false;
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.hideQuickBall = this.excludedRoutes.includes(this.router.url);
      });
    }
  }

  private initializeLocationTracking() {
    if (this.authService.getRole() !== 'recruiter') {
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    const recruiterId = this.authService.getId();
    this.setupInitialLocation(recruiterId!);
    this.startLocationTracking(recruiterId!);
  }

  private setupInitialLocation(recruiterId: string) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.lastLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          recruiterId: recruiterId
        };
        console.log('Initial location set:', this.lastLocation);
      },
      (error) => {
        console.error('Error getting initial location:', error);
        this.handleGeolocationError(error);
      },
      { enableHighAccuracy: true }
    );
  }

  private startLocationTracking(recruiterId: string) {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }

    this.locationUpdateInterval = setInterval(() => {
      this.updateLocation(recruiterId);
    }, this.UPDATE_INTERVAL);
  }

  private updateLocation(recruiterId: string) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          recruiterId: recruiterId
        };

        const distance = this.getDistanceFromLatLon(this.lastLocation, newLocation) * 1000; 
        console.log('📏 Calculated Distance:', distance.toFixed(2), 'meters');

        if (distance >= this.MIN_DISTANCE) { 
          console.log(' Moved more than 1');
          this.locationData = newLocation;
          this.lastLocation = newLocation;
          this.socket.emit('updateLocation', { ...this.locationData});
        } else {
          console.log('⏳ Movement not significant, skipping update.');
        }
      },
      (error) => {
        console.error('Error tracking location:', error);
        this.handleGeolocationError(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000, 
        timeout: 10000
      }
    );
  }

  private getDistanceFromLatLon(loc1: Location | null, loc2: Location | null): number {
    if (!loc1 || !loc2) return 0;

    const R = 6371;
    const dLat = this.deg2rad(loc2.latitude - loc1.latitude);
    const dLon = this.deg2rad(loc2.longitude - loc1.longitude);

    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(loc1.latitude)) * 
      Math.cos(this.deg2rad(loc2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private handleGeolocationError(error: GeolocationPositionError) {
    let errorMessage = 'Unknown error occurred while getting location.';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = ' Location permission denied by user.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = ' Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
    }
    
    console.error('Geolocation error:', errorMessage);
  }

  showUploadModal() {
    this.modalService.openModal();
  }

  hideUploadModal() {
    this.modalService.closeModal();
  }

  ngOnDestroy() {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }
  }
}
