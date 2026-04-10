import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Candidate } from '../models/candidate'; // ✅ only this import

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8081/api/users';
    private candidateApiUrl = 'http://localhost:8081/api/candidates';
    private currentUserSubject = new BehaviorSubject<Candidate | null>(null); // ✅
    public currentUser$ = this.currentUserSubject.asObservable();
    private isBrowser: boolean;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

        if (this.isBrowser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                try {
                    this.currentUserSubject.next(JSON.parse(stored));
                } catch {
                    localStorage.removeItem('currentUser');
                }
            }
        }
    }
    login(email: string, motDePasse: string): Observable<Candidate> {
        return this.http.post<Candidate>(`${this.apiUrl}/login`, { email, motDePasse })
            .pipe(tap(user => {
                if (this.isBrowser) localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            }));
    }


    logout(): void {
        if (this.isBrowser) {
            localStorage.removeItem('currentUser');
        }
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null;
    }

    getCurrentUser(): Candidate | null { // ✅
        return this.currentUserSubject.value;
    }

    getUserById(id: number): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.candidateApiUrl}/${id}`);
    }

    updateProfile(id: number, formData: FormData): Observable<Candidate> {
        return this.http.put<Candidate>(`${this.candidateApiUrl}/${id}/profile`, formData)
            .pipe(tap(user => this.updateUserSession(user)));
    }


    updateUserSession(user: Candidate): void { // ✅
        if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
    }

    getPhotoUrl(photoPath: string | null): string {
        if (!photoPath) return '';
        const parts = photoPath.split('/');
        const filename = parts[parts.length - 1];
        return `${this.apiUrl}/photos/${filename}`;
    }

    getCvUrl(cvPath: string): string {
        const parts = cvPath.split('/');
        const filename = parts[parts.length - 1];
        return `${this.apiUrl}/cv/${filename}`;
    }
    forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
}
}