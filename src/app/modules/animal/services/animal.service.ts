import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnimalReportUpdateResponse } from '../../../core/interfaces/responses/animal-report.interface';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {

  constructor(private http:HttpClient) { }


  updateAlert(alertData: { 
    animalReportId: string, 
    status: string, 
    recruiterId?: string, 
    doctorId?: string, 
    location?: { latitude: number; longitude: number } 
  }): Observable<AnimalReportUpdateResponse> {
    const url = `${environment.api}/animal/update-alert`;
    return this.http.post<AnimalReportUpdateResponse>(url, alertData);
  }
  
}
