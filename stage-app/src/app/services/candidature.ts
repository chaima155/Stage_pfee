import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CandidatureService {

  private apiUrl = 'http://localhost:8081/api/candidatures';
  private entretienUrl = 'http://localhost:8081/api/entretien';

  constructor(private http: HttpClient) {}

  postuler(
    sujetId: number,
    candidateId: number,
    typeEntretien: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('sujetId', sujetId.toString());
    formData.append('candidateId', candidateId.toString());
    formData.append('typeEntretien', typeEntretien);
    return this.http.post<any>(this.apiUrl, formData);
  }

  // ✅ Corrigé : retourne Observable
  supprimerDate(entretienId: number): Observable<any> {
    return this.http.delete(`${this.entretienUrl}/${entretienId}/choisir`);
  }

  // ✅ Récupérer toutes les dates des sujets acceptés du candidat
  getDatesByCandidat(candidateId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/candidate/${candidateId}/dates`
    );
  }

  getCandidaturesByCandidate(candidateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidate/${candidateId}`);
  }

  getCandidaturesBySujet(sujetId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sujet/${sujetId}`);
  }

  getAllCandidatures(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}