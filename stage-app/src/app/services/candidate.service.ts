import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/candidate';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:8081/api/candidates';

  constructor(private http: HttpClient) { }

  registerCandidate(candidate: Candidate, file?: File): Observable<Candidate> {
    const formData = new FormData();
    formData.append(
      'candidate',
      new Blob([JSON.stringify(candidate)], { type: 'application/json' })
    );
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<Candidate>(`${this.apiUrl}/register`, formData); // ✅ fixed
  }

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}`);
  }

  getCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
  }

  updateCandidate(id: number, candidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, candidate);
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}