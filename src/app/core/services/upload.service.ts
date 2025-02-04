import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http:HttpClient){}
  private isModalOpenSubject = new BehaviorSubject<boolean>(false);
  isModalOpen$ = this.isModalOpenSubject.asObservable();



  openModal() {
    this.isModalOpenSubject.next(true);
  }

  closeModal() {
    this.isModalOpenSubject.next(false);
  }

  uploadReport(data:FormData): Observable<any> {
    data.forEach( datas => {
      console.log('daataaass are ',datas)
    })

    return this.http.post<any>(`${environment.api}/animal/animal-report`, data,  { headers: { 'enctype': 'multipart/form-data' } }
    );
  }


}
