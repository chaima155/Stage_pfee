import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-candidature-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidature-list.html',
  styleUrl: './candidature-list.css'
})
export class CandidatureList implements OnInit {

  candidatures: any[] = [];
  filtered: any[] = [];
  loading = true;
  searchText = '';
  selectedStatut = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<any[]>('http://localhost:8081/api/candidatures').subscribe({
      next: (data) => {
        this.candidatures = data;
        this.filtered     = data;
        this.loading      = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  filter(): void {
    this.filtered = this.candidatures.filter(c => {
      const nom    = `${c.candidate?.prenom || ''} ${c.candidate?.nom || ''}`.toLowerCase();
      const titre  = c.sujetStage?.titre?.toLowerCase() || '';
      const search = this.searchText.toLowerCase();

      const matchSearch = !this.searchText ||
        nom.includes(search) || titre.includes(search);

      const matchStatut = !this.selectedStatut ||
        c.statut === this.selectedStatut;

      return matchSearch && matchStatut;
    });
  }

  getStatutClass(statut: string): string {
    if (statut === 'VALIDEE')  return 'badge-validee';
    if (statut === 'REJETEE')  return 'badge-rejetee';
    return '';
  }

  getTypeClass(type: string): string {
    const t = type?.toLowerCase();
    if (t === 'enligne')    return 'badge-enligne';
    if (t === 'presentiel') return 'badge-presentiel';
    return '';
  }

  getTypeLabel(type: string): string {
    const t = type?.toLowerCase();
    if (t === 'enligne')    return '🖥️ En ligne';
    if (t === 'presentiel') return '🏢 Présentiel';
    return type || '—';
  }
}