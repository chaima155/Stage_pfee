import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CandidatureService } from '../../services/candidature';
import { EntretienService } from '../../services/entretien';

@Component({
  selector: 'app-choisir-date',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choisir-date.html',
  styleUrls: ['./choisir-date.css']
})
export class ChoisirDate implements OnInit, OnDestroy {

  datesDisponibles: any[] = [];
  dateChoisie: any = null;
  loading: boolean = true;
  selectedDay: number | null = null;
  selectedDayLabel: string = '';
  typeEntretien: string = '';
  private timerInterval: any = null;

  candidateId: number = Number(localStorage.getItem('candidateId'));
  candidatureId: number | null = null;

  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: (number | null)[] = [];
  dernierResultat: string = ''; 
  raisonMessage: string = '';

  monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(
    public router: Router,
    private candidatureService: CandidatureService,
    private entretienService: EntretienService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  this.entretienService.peutChoisirDate(this.candidateId).subscribe({
    next: (result) => {
      if (result.peutChoisir) {
        this.candidatureId = result.candidatureId;

        if (result.dernierResultat) {
          this.dernierResultat = result.dernierResultat;
        }

        this.loadDates();
        this.checkEntretienChoisi();

      } else {
        this.candidatureId = result.candidatureId || null;

        if (result.dateExistante) {
          const datePassed = new Date(result.dateExistante) < new Date();

          if (datePassed) {
            // ✅ Entretien terminé — vider dateChoisie + afficher calendrier vide
            this.dateChoisie = null;
            this.typeEntretien = '';
            this.datesDisponibles = [];
            this.loading = false;
            this.generateCalendar();
            this.cdr.detectChanges();
          } else {
            // ✅ Date future — afficher confirmation
            this.checkEntretienChoisi();
            this.loading = false;
            this.generateCalendar();
            this.cdr.detectChanges();
          }
        } else {
          // ✅ Pas de date — calendrier vide
          this.dateChoisie = null;
          this.datesDisponibles = [];
          this.loading = false;
          this.generateCalendar();
          this.cdr.detectChanges();
        }
      }
    },
    error: (err) => {
      console.error('Erreur:', err);
      this.loading = false;
      this.generateCalendar();
    }
  });

  this.timerInterval = setInterval(() => {
    this.cdr.detectChanges();
  }, 60000);
}
  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // ✅ Vérifier si le candidat a déjà choisi une date
  checkEntretienChoisi(): void {
  this.entretienService.getEntretiens().subscribe({
    next: (entretiens: any[]) => {
      const found = entretiens.find(e =>
        !e.disponible &&
        e.candidature?.id === this.candidatureId
      );
      if (found) {
        const datePassed = new Date(found.date) < new Date();

        if (datePassed) {
          // ✅ Entretien terminé — ne pas afficher la carte
          this.dateChoisie = null;
          this.typeEntretien = '';
        } else {
          // ✅ Date future — afficher confirmation
          this.dateChoisie = found;
          this.typeEntretien = found.candidature?.typeEntretien?.toLowerCase()
            .replace(/\s+/g, '').replace('_', '') || '';
        }

        console.log('typeEntretien:', this.typeEntretien);
        this.cdr.detectChanges();
      }
    }
  });
}

  loadDates(): void {
  this.loading = true;

  // ✅ Supprimer les dates passées d'abord
  this.entretienService.supprimerDatesPassees().subscribe({
    next: (res) => {
      console.log('🗑️ Dates passées supprimées:', res.count);

      // ✅ Puis charger les dates disponibles
      this.entretienService.getEntretiensDisponibles().subscribe({
        next: (data) => {
          this.datesDisponibles = data;
          this.loading = false;
          this.generateCalendar();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.generateCalendar();
        }
      });
    },
    error: () => {
      // ✅ Si erreur suppression — charger quand même
      this.entretienService.getEntretiensDisponibles().subscribe({
        next: (data) => {
          this.datesDisponibles = data;
          this.loading = false;
          this.generateCalendar();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.generateCalendar();
        }
      });
    }
  });
}

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay  = new Date(this.currentYear, this.currentMonth + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    this.calendarDays = [];
    for (let i = 0; i < startDayOfWeek; i++) this.calendarDays.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) this.calendarDays.push(d);
  }

  prevMonth(): void {
    if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear--; }
    else this.currentMonth--;
    this.selectedDay = null;
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++; }
    else this.currentMonth++;
    this.selectedDay = null;
    this.generateCalendar();
  }

  hasEntretien(day: number | null): boolean {
    if (!day) return false;
    return this.datesDisponibles.some(e => {
      const d = new Date(e.date);
      return d.getDate() === day &&
             d.getMonth() === this.currentMonth &&
             d.getFullYear() === this.currentYear;
    });
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() &&
           this.currentMonth === today.getMonth() &&
           this.currentYear === today.getFullYear();
  }

  isPast(day: number | null): boolean {
    if (!day) return false;
    const date = new Date(this.currentYear, this.currentMonth, day);
    const today = new Date();
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  selectDay(day: number | null): void {
    if (!day) return;
    this.selectedDay = day;
    this.selectedDayLabel = `${day} ${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  getEntretiensForDay(day: number | null): any[] {
    if (!day) return [];
    return this.datesDisponibles.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day &&
             d.getMonth() === this.currentMonth &&
             d.getFullYear() === this.currentYear;
    });
  }

  choisirDate(entretienId: number): void {
  if (!this.candidatureId) {
    alert('Aucune candidature validée trouvée.');
    return;
  }

  if (confirm('Confirmer ce créneau ?')) {
    const entretien = this.datesDisponibles.find(e => e.id === entretienId);

    this.entretienService.choisirDate(entretienId, this.candidatureId).subscribe({
      next: () => {
        this.dateChoisie = entretien;

        // ✅ Récupérer typeEntretien depuis candidature validée
        this.entretienService.getEntretiens().subscribe({
          next: (entretiens: any[]) => {
            const found = entretiens.find(e => e.id === entretienId);
            if (found) {
              this.typeEntretien = found.candidature?.typeEntretien?.toLowerCase()
                .replace(/\s+/g, '').replace('_', '') || '';
              console.log('typeEntretien après choix:', this.typeEntretien);
            }
          }
        });

        localStorage.setItem('entretienRoom', 'room-' + entretien.id);
        localStorage.setItem('entretienId',   String(entretien.id));
        this.datesDisponibles = this.datesDisponibles.filter(e => e.id !== entretienId);
        this.selectedDay = null;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur:', err)
    });
  }
}


  // ✅ Vérifier si l'entretien peut commencer
  canJoin(): boolean {
  if (!this.dateChoisie?.date) return false;
  if (!this.candidatureId) return false; // ✅ pas de candidature = pas d'accès

  // ✅ Vérifier type enligne
  if (this.typeEntretien !== 'enligne') return false;

  const now = new Date();
  const dateEntretien = new Date(this.dateChoisie.date);

  const memeJour =
    now.getDate()     === dateEntretien.getDate()     &&
    now.getMonth()    === dateEntretien.getMonth()    &&
    now.getFullYear() === dateEntretien.getFullYear();

  if (!memeJour) return false;

  const cinqMinutesAvant = new Date(dateEntretien.getTime() - 5  * 60 * 1000);
  const uneHeureApres    = new Date(dateEntretien.getTime() + 60 * 60 * 1000);

  return now >= cinqMinutesAvant && now <= uneHeureApres;
}

  // ✅ Temps restant
  
  getTempsRestant(): string {
    if (!this.dateChoisie?.date) return '';

    const now = new Date();
    const dateEntretien = new Date(this.dateChoisie.date);
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

  // ✅ AJOUTER ICI
  entretienTermine(): boolean {
    if (!this.dateChoisie?.date) return false;
    const dateEntretien = new Date(this.dateChoisie.date);
    // ✅ Présentiel → terminé dès que la date est passée
    // ✅ En ligne → terminé 1h après le début
    if (this.typeEntretien === 'enligne') {
      const uneHeureApres = new Date(dateEntretien.getTime() + 60 * 60 * 1000);
      return new Date() > uneHeureApres;
    }
    return new Date() > dateEntretien;
  }

  // ✅ Candidat rejoint le video call
  rejoindreAppel(): void {
  if (this.typeEntretien !== 'enligne') {
    alert('Cet entretien est en présentiel — pas d\'appel vidéo.');
    return;
  }

  if (!this.candidatureId) {
    alert('Aucune candidature trouvée.');
    return;
  }

  if (!this.canJoin()) {
    alert(`L'entretien n'a pas encore commencé.\n⏳ ${this.getTempsRestant()}`);
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  localStorage.setItem('entretienRoom',  'room-' + this.dateChoisie.id);
  localStorage.setItem('entretienId',    String(this.dateChoisie.id));
  localStorage.setItem('candidateEmail', currentUser.email  || '');
  localStorage.setItem('candidateName',  `${currentUser.prenom || ''} ${currentUser.nom || ''}`);

  this.router.navigate(['/video-call']);
}
}