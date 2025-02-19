import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { loginResponse } from '../../interfaces/responses/loginResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminService {



  
    constructor(private http:HttpClient) { }
  
    login(credentials:{email:string;password:string}):Observable<loginResponse>{
      console.log('ahiidd  adminlogin servicicllll ann')
      return this.http.post<loginResponse>(`${environment.api}/admin/login`,credentials,{withCredentials:true})
    }

    getUnverifiedDoctorsAndRecruiters(): Observable<any> {
      return this.http.get(`${environment.api}/admin/unverified-doctors&recruiters`);
    }

    verifyUser(userId:number,role:string){
      console.log('doctorre heeyey',role)
      if(role==='doctor'){
        return this.http.post(`${environment.api}/admin/verify-doctor`,{userId,role})
      }else{
        console.log('hsiiriirre recruiter',role)
        return this.http.post(`${environment.api}/admin/verify-recruiter`,{userId,role})
      }
    }
    
}
