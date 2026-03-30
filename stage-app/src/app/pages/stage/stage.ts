import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SujetStageService } from '../../services/sujet-stage';

@Component({
  selector: 'app-stage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage.html',
  styleUrl: './stage.css'
})
export class Stage implements OnInit {
  sujets: any[] = [];
  loading = true;

  constructor(
    private sujetService: SujetStageService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sujetService.getSujets().subscribe({
      next: (data) => {
        this.sujets = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  postuler(sujetId: number): void {
    const candidateId = localStorage.getItem('candidateId');
    if (!candidateId) {
      localStorage.setItem('redirectSujetId', sujetId.toString());
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/candidature/create', sujetId]);
    }
  }
}