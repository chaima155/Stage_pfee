import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class EntretienService {
  private apiUrl = 'http://localhost:8081/api/entretien';
   constructor(private http: HttpClient) {}

   // Ajouter un entretien 
       addentretien(entretien: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, entretien);
}
}
