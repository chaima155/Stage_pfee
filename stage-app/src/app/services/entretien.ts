import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entretien } from '../model/entretien';


@Injectable({
  providedIn: 'root',
})
export class EntretienService {
  private apiUrl = 'http://localhost:8081/api/entretien';
   constructor(private http: HttpClient) {}

   // Ajouter un entretien 
       addentretien(entretien: Entretien): Observable<Entretien> {
         return this.http.post<Entretien>(this.apiUrl, entretien);
       }
}
