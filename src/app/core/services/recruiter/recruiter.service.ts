import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { loginResponse } from '../../interfaces/loginResponse.interface';
import { registerResponse } from '../../interfaces/registerResponse.interface';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RecruiterService {

  constructor(private http:HttpClient) { }

  private api = 'http://localhost:4040/recruiter'

  register(formData: FormData): Observable<registerResponse> {
    return this.http.post<registerResponse>(`${this.api}/register`, formData, {
      withCredentials: true
    });
  } 

  login(credentials:{email:string;password:string}):Observable<loginResponse>{
    console.log('ahiidd recruiters  login servicicllll ann')
    return this.http.post<loginResponse>(`${this.api}/login`, credentials, { withCredentials: true });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${environment.api}/recruiter/profile`,{withCredentials:true});
  }

}
