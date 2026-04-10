import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EntretienService } from '../../services/entretien';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-entretien-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './entretien-list.html',
  styleUrl: './entretien-list.css'
})
export class EntretienList implements OnInit, OnDestroy {

  entretiens: any[] = [];
  loading = true;
  private timerInterval: any = null;

  constructor(
    private entretienService: EntretienService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadEntretiens();
    this.timerInterval = setInterval(() => {
  this.cdr.detectChanges();
}, 30000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  loadEntretiens(): void {
    this.entretienService.getEntretiens().subscribe({
      next: (data) => {
        this.entretiens = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  deleteEntretien(id: number): void {
    if (confirm('Supprimer cette date ?')) {
      this.entretienService.deleteEntretien(id).subscribe({
        next: () => {
          this.entretiens = this.entretiens.filter(e => e.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  // ✅ Seulement pour entretien EN LIGNE + même jour + bonne heure
  canJoin(entretien: any): boolean {
    if (!entretien.date) return false;
    if (entretien.disponible) return false;
    if (entretien.resultat) return false;

    // ✅ Vérifier type enligne uniquement
    const type = entretien.candidature?.typeEntretien?.toLowerCase()
      .replace(/\s+/g, '').replace('_', '');
    if (type !== 'enligne') return false;

    const now = new Date();
    const dateEntretien = new Date(entretien.date);

    const memeJour =
      now.getDate()     === dateEntretien.getDate()     &&
      now.getMonth()    === dateEntretien.getMonth()    &&
      now.getFullYear() === dateEntretien.getFullYear();

    if (!memeJour) return false;

    const cinqMinutesAvant = new Date(dateEntretien.getTime() - 5  * 60 * 1000);
    const uneHeureApres    = new Date(dateEntretien.getTime() + 60 * 60 * 1000);

    return now >= cinqMinutesAvant && now <= uneHeureApres;
  }

  // ✅ Temps restant — seulement pour enligne
  getTempsRestant(entretien: any): string {
    if (!entretien.date) return '';

    const now = new Date();
    const dateEntretien = new Date(entretien.date);
    const diff = dateEntretien.getTime() - now.getTime();

    if (diff <= 0) return 'En cours';

    const jours   = Math.floor(diff / (1000 * 60 * 60 * 24));
    const heures  = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (jours > 0)   return `Dans ${jours}j ${heures}h`;
    if (heures > 0)  return `Dans ${heures}h ${minutes}min`;
    if (minutes > 0) return `Dans ${minutes} min`;
    return 'Maintenant !';
  }

  // ✅ Rejoindre le video call
  joinCall(entretien: any): void {
    localStorage.setItem('entretienRoom',  'room-' + entretien.id);
    localStorage.setItem('entretienId',    String(entretien.id));
    localStorage.setItem('candidateEmail', entretien.candidature?.candidate?.email || '');
    localStorage.setItem('candidateName',
      `${entretien.candidature?.candidate?.prenom || ''} ${entretien.candidature?.candidate?.nom || ''}`
    );
    this.router.navigate(['/video-call']);
  }

  // ✅ Peut décider manuellement
  peutDecider(entretien: any): boolean {
    if (entretien.resultat) return false;
    if (!entretien.candidature) return false;

    const type = entretien.candidature?.typeEntretien?.toLowerCase()
      .replace(/\s+/g, '').replace('_', '');
    const datePassed = entretien.date && new Date(entretien.date) < new Date();

    // ✅ Présentiel — toujours décider manuellement
    if (type === 'presentiel') return true;

    // ✅ En ligne — seulement si date passée
    if (type === 'enligne' && datePassed) return true;

    return false;
  }

  // ✅ Envoyer décision
  envoyerDecision(entretien: any, resultat: string): void {
    if (!confirm(`Confirmer : ${resultat === 'ACCEPTE' ? 'Accepter' : 'Refuser'} ce candidat ?`)) return;

    entretien.sending = true;

    this.http.put(
      `http://localhost:8081/api/entretien/${entretien.id}/terminer`,
      {
        resultat:       resultat,
        notes:          `Décision manuelle : ${resultat}`,
        candidateEmail: entretien.candidature?.candidate?.email || '',
        candidateName:  `${entretien.candidature?.candidate?.prenom || ''} ${entretien.candidature?.candidate?.nom || ''}`
      }
    ).subscribe({
      next: () => {
        entretien.resultat = resultat;
        entretien.sending  = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur décision:', err);
        entretien.sending = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ Vérifier si type enligne
  isEnLigne(entretien: any): boolean {
    const type = entretien.candidature?.typeEntretien?.toLowerCase()
      .replace(/\s+/g, '').replace('_', '');
    return type === 'enligne';
  }

  // ✅ Vérifier si type présentiel
  isPresentiel(entretien: any): boolean {
    const type = entretien.candidature?.typeEntretien?.toLowerCase()
      .replace(/\s+/g, '').replace('_', '');
    return type === 'presentiel';
  }
}