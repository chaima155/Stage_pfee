import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class ChoisirDate implements OnInit {
  datesDisponibles: any[] = [];
  dateChoisie: any = null;
  loading: boolean = true;
  selectedDay: number | null = null;
  selectedDayLabel: string = '';

  candidateId: number = Number(localStorage.getItem('candidateId'));

  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: (number | null)[] = [];

  monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(
    public router: Router,
    private candidatureService: CandidatureService,
    private entretienService: EntretienService,
    private cdr: ChangeDetectorRef  // ✅ Ajouter
  ) {}

  ngOnInit(): void {
    this.loadDates(); // ✅ Charger les dates disponibles
  }

  // ✅ Charger seulement les entretiens disponibles
  loadDates(): void {
    this.loading = true;
    this.entretienService.getEntretiensDisponibles().subscribe({
      next: (data) => {
        this.datesDisponibles = data; // ✅ utiliser datesDisponibles
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

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    this.calendarDays = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      this.calendarDays.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      this.calendarDays.push(d);
    }
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.selectedDay = null;
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
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
    const today = new Date();
    const date = new Date(this.currentYear, this.currentMonth, day);
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

  // ✅ Choisir une date → marquer non disponible
  choisirDate(entretienId: number): void {
    if (confirm('Confirmer ce créneau ?')) {
      this.entretienService.choisirDate(entretienId).subscribe({
        next: () => {
          // ✅ Retirer de la liste affichée
          this.datesDisponibles = this.datesDisponibles.filter(e => e.id !== entretienId);
          this.selectedDay = null;
          this.cdr.detectChanges();
          alert('✅ Date confirmée !');
          this.router.navigate(['/my-space']);
        },
        error: (err) => console.error('Erreur:', err)
      });
    }
  }
}