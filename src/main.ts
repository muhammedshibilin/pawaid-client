import { AppComponent } from './app/app.component';
import { routes } from '../src/app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { isDevMode, importProvidersFrom } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { blockCheckInterceptor } from './app/core/interceptors/block-check.interceptor';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';


export const firebaseConfig = {
  apiKey: "AIzaSyAKE1WChof2dlwR-vRXvEBDN7ibbK4myZM",
  authDomain: "pawaid-956b3.firebaseapp.com",
  projectId: "pawaid-956b3",
  storageBucket: "pawaid-956b3.firebasestorage.app",
  messagingSenderId: "332134958469",
  appId: "1:332134958469:web:749f0652705fc06c8370ec",
  measurementId: "G-BLN56L76YC"
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

export function tokenGetter() {
  return localStorage.getItem('accessToken');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([blockCheckInterceptor, authInterceptor])),
    CookieService,
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Initialize Firebase App
    provideAuth(() => getAuth()), // Initialize Firebase Auth
    provideMessaging(() => getMessaging()), // Initialize Firebase Messaging
    JwtHelperService,
    DragDropModule,
    importProvidersFrom(FontAwesomeModule),
    provideToastr({
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'increasing',
    }),
    {
      provide: JWT_OPTIONS,
      useValue: {
        tokenGetter: () => localStorage.getItem('accessToken'),
        allowedDomains: ['localhost:4040'],
        disallowedRoutes: []
      }
    },
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideServiceWorker('firebase-messaging-sw.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
}).catch(err => console.error(err));

