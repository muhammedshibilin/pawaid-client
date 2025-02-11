
import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { getToken, onMessage } from 'firebase/messaging';
import { Messaging } from '@angular/fire/messaging';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messaging = inject(Messaging); 



  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {

  }

  async requestPermission(): Promise<void> {
    try {
      const token = await getToken(this.messaging, {
        vapidKey:`${environment.vapidPublicKey}`,
        serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
      });

      if (token) {
        console.log('FCM Token:', token);
        this.sendTokenToBackend(token, true);
      } else {
        console.error('No token received');
        this.toastr.error('Failed to get FCM token.', 'Error');
      }
    } catch (error) {
      console.error('Unable to get permission:', error);
      this.toastr.error('Failed to enable notifications.', 'Error');
    }
  }

  private sendTokenToBackend(token: string, enable: boolean) {
    if (enable) {
      this.http.post(`${environment.api}/notification/subscribe`, { token }).subscribe(
        () => {
          this.toastr.success('Notifications enabled successfully', 'Success');
          localStorage.setItem('notificationsEnabled', 'true'); 
        },
        (error) => console.error('Failed to send token to backend:', error)
      );
    } else {
      this.http.post(`${environment.api}/notification/unsubscribe`,{token}).subscribe(
        () =>{
          this.toastr.success('Notifications disabled successfully', 'Success');
          localStorage.setItem('notificationsEnabled', 'false');
        },
        (error) => console.error('Failed to remove token from backend:', error)
      );
    }
  }


  enableNotifications(notificationsEnabled: boolean): void {
    if (notificationsEnabled) {
      this.requestPermission();
    } else {
      this.sendTokenToBackend('', false); 
    }
  }

  

  listenForMessages() {
    onMessage(this.messaging, (payload) => {
        this.toastr.info(payload.notification?.body, payload.notification?.title);
        if (payload.data?.['redirectUrl']) {
          this.handleRedirect(payload.data?.['redirectUrl']);
        }
      });
    }

    private handleRedirect(url: string) {

      window.location.href = url; 
    }
  }

