import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EntretienService {

  private apiUrl = 'http://localhost:8081/api/entretien';

  constructor(private http: HttpClient) {}

  addentretien(entretien: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, entretien);
  }

  getEntretiens(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getEntretiensDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/disponibles`);
  }

  // ✅ Corrigé — 2 arguments
  choisirDate(entretienId: number, candidatureId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${entretienId}/choisir`,
      { candidatureId: candidatureId }
    );
  }

  // ✅ Ajouter responseType: 'text'
deleteEntretien(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
}
}