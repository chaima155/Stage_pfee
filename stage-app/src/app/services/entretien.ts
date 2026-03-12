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
    getEntretiens(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
    }

    // ✅ Récupérer seulement les disponibles
getEntretiensDisponibles(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/disponibles`);
}

// ✅ Choisir une date (PUT au lieu de DELETE)
choisirDate(id: number): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/${id}/choisir`, {});
}

  // ✅ Ajouter
    deleteEntretien(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
