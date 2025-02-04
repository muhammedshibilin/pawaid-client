import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  constructor(private http:HttpClient) { }
 private api = 'http://localhost:4040'
   verifyOtp(userId: string, otp: string): Observable<any> {
    const url = `${this.api}/verify-otp`;
    return this.http.post(url,{ userId, otp },{withCredentials:true}  );
  }

  

  resendOtp(userId:string): Observable<any> {
    const url = `${this.api}/resend-otp`;
    return this.http.post(url, {userId} );
  }
  
}
