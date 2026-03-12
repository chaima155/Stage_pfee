import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EntretienService } from '../../services/entretien';

@Component({
  selector: 'app-entretien-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './entretien-list.html',
  styleUrl: './entretien-list.css'
})
export class EntretienList implements OnInit {
  entretiens: any[] = [];
  loading = true;

  constructor(
    private entretienService: EntretienService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEntretiens();
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
}