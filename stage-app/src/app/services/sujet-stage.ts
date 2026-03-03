import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SujetStage } from '../model/sujet-stage';


@Injectable({
  providedIn: 'root',
})
export class SujetStageService {
   private apiUrl = 'http://localhost:8081/api/sujets'; // URL de Spring Boot

    constructor(private http: HttpClient) {
      this.getSujets();
    }

    // Ajouter un sujet dans la base via Spring Boot
    addSujet(sujet: SujetStage): Observable<SujetStage> {
      return this.http.post<SujetStage>(this.apiUrl, sujet);
    }

    // Récupérer tous les sujets
    getSujets(): Observable<SujetStage[]> {
      return this.http.get<SujetStage[]>(this.apiUrl);
    }

    //modifier
    updateSujet(id: number, sujet: SujetStage): Observable<SujetStage> {
      return this.http.put<SujetStage>(`${this.apiUrl}/${id}`, sujet);
    }



    //supprimer un sujets
    deleteSujet(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}
