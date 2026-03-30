import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SujetStage } from '../models/sujet-stage';


@Injectable({
  providedIn: 'root',
})
export class SujetStageService {
   private apiUrl = 'http://localhost:8081/api/sujets'; // URL de Spring Boot

    constructor(private http: HttpClient) {
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
    updateSujet(id: number, sujet: any) {
  return this.http.put(`http://localhost:8081/api/sujets/${id}`, sujet);
}
      // Dans sujet-stage.service.ts ✅ déjà présent dans votre backend
    getSujetById(id: number): Observable<SujetStage> {
      return this.http.get<SujetStage>(`${this.apiUrl}/${id}`);
}



    //supprimer un sujets
   deleteSujet(id: number) {
  return this.http.delete(
    `http://localhost:8081/api/sujets/${id}`,
    { responseType: 'text' } // 👈 TRÈS IMPORTANT
  );
}
}