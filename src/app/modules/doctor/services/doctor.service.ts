import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { loginResponse } from '../../../core/interfaces/responses/loginResponse.interface';
import { registerResponse } from '../../../core/interfaces/responses/registerResponse.interface';
import { environment } from '../../../../environments/environment.development';
import { IDoctor } from '../../../core/interfaces/entities/doctor.interface';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(private http: HttpClient) { }

  private api = 'http://localhost:4040/doctor'


  register(formData: FormData): Observable<registerResponse> {
    return this.http.post<registerResponse>(`${this.api}/register`, formData, { withCredentials: true });
  }

  login(credentials: { email: string; password: string }): Observable<loginResponse> {
    console.log('ahiidd doctor login servicicllll ann', credentials)
    return this.http.post<loginResponse>(`${this.api}/login`, credentials, { withCredentials: true });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${environment.api}/doctor/profile`, { withCredentials: true });
  }

  fetchRescueAppointment(doctorId: number): Observable<any> {
    const url = `${environment.api}/doctor/rescue-appointment/${doctorId}`;
    return this.http.get<any>(url);
  }
  fetchNearbyDoctors(location: { latitude: number; longitude: number }): Observable<IDoctor[]> {
    console.log('location', location)
    const url = `${environment.api}/doctor/find-nearby?latitude=${location.latitude}&longitude=${location.longitude}`;
    return this.http.get<{ success: boolean; data: IDoctor[] }>(url).pipe(
      map(response => response.data)
    );
  }

  assignedDoctor(doctorId:number){

  }

}
