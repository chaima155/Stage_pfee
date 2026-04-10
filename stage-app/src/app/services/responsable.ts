import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Responsable {
  id?: number;
  prenom: string;
  nom: string;
  email: string;
  department?: string;
  poste?: string;
  service?: string;
  photo?: string | null;
  motDePasse?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResponsableService {
  private apiUrl = 'http://localhost:8081/api/responsables';
  private currentResponsableSubject = new BehaviorSubject<Responsable | null>(null);
  public currentResponsable$ = this.currentResponsableSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const stored = localStorage.getItem('currentResponsable');
      if (stored) {
        try {
          this.currentResponsableSubject.next(JSON.parse(stored));
        } catch {
          localStorage.removeItem('currentResponsable');
        }
      }
    }
  }

  /**
   * Get current responsable from server
   */
  getCurrentResponsable(): Observable<Responsable> {
  // ✅ Récupérer l'ID depuis localStorage
  const stored = localStorage.getItem('currentResponsable') 
              || localStorage.getItem('user');
  
  if (stored) {
    const data = JSON.parse(stored);
    if (data.id) {
      return this.http.get<Responsable>(`${this.apiUrl}/${data.id}`).pipe(
        tap(responsable => this.updateResponsableSession(responsable))
      );
    }
  }
  
  return this.http.get<Responsable>(`${this.apiUrl}/me`).pipe(
    tap(responsable => this.updateResponsableSession(responsable))
  );
}

  /**
   * Get current responsable value (synchronous)
   */
  getCurrentResponsableValue(): Responsable | null {
    return this.currentResponsableSubject.value;
  }

  /**
   * Update session data
   */
  updateResponsableSession(responsable: Responsable): void {
    if (this.isBrowser) {
      localStorage.setItem('currentResponsable', JSON.stringify(responsable));
    }
    this.currentResponsableSubject.next(responsable);
  }

  /**
   * Logout
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentResponsable');
    }
    this.currentResponsableSubject.next(null);
  }

  /**
   * Get responsable by ID
   */
  getResponsableById(id: number): Observable<Responsable> {
    return this.http.get<Responsable>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all responsables
   */
  getAllResponsables(): Observable<Responsable[]> {
    return this.http.get<Responsable[]>(this.apiUrl);
  }

  /**
   * Create new responsable
   */
  createResponsable(data: Responsable): Observable<Responsable> {
    return this.http.post<Responsable>(this.apiUrl, data);
  }

  /**
   * Update responsable
   */
  updateResponsable(id: number, data: Responsable): Observable<Responsable> {
  return this.http.put<Responsable>(`${this.apiUrl}/${id}`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
}

  /**
   * Update responsable photo
   */
  updatePhoto(id: number, formData: FormData): Observable<Responsable> {
    return this.http.post<Responsable>(`${this.apiUrl}/${id}/photo`, formData).pipe(
      tap(updated => this.updateResponsableSession(updated))
    );
  }

  /**
   * Change password
   */
  changePassword(id: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/change-password`, {
      newPassword: newPassword
    });
  }

  /**
   * Delete responsable account
   */
  deleteResponsable(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.logout())
    );
  }

  /**
   * Get photo URL with cache busting
   * @param photoPath - Path to the photo
   * @param timestamp - Optional timestamp for cache busting (optional)
   */
  getPhotoUrl(photoPath: string, timestamp?: number): string {
    if (!photoPath) return '';
    const filename = photoPath.split('/').pop();
    const t = timestamp || new Date().getTime(); // 👈 Use provided timestamp or generate new one
    return `${this.apiUrl}/photos/${filename}?t=${t}`;
  }

  /**
   * Search responsables
   */
  searchResponsables(query: string): Observable<Responsable[]> {
    return this.http.get<Responsable[]>(`${this.apiUrl}/search?q=${query}`);
  }

  /**
   * Get responsables by departement
   */
  getByDepartement(departement: string): Observable<Responsable[]> {
    return this.http.get<Responsable[]>(`${this.apiUrl}/departement/${departement}`);
  }
}