import { Component, OnInit, ChangeDetectorRef } from '@angular/core';  // ✅
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CandidatureService } from '../../services/candidature';
import { SujetStageService } from '../../services/sujet-stage';
import { SujetStage } from '../../models/sujet-stage';

@Component({
  selector: 'app-candidature-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './candidature-create.html',
  styleUrls: ['./candidature-create.css']
})
export class CandidatureCreate implements OnInit {
  sujet: SujetStage | null = null;
  typeEntretien: string = '';
  loading: boolean = false;
  analysisResult: any = null;
  submitted: boolean = false;
  isSubmitting: boolean = false;      // ✅ Ajouter
  errorMessage: string = '';          // ✅ Ajouter

  candidateId: number = Number(localStorage.getItem('candidateId'));

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private candidatureService: CandidatureService,
    private sujetService: SujetStageService,
    private cdr: ChangeDetectorRef    // ✅ Ajouter
  ) {}

  ngOnInit(): void {
    const sujetId = Number(this.route.snapshot.paramMap.get('id'));
    this.sujetService.getSujetById(sujetId).subscribe({
      next: (data) => this.sujet = data,
      error: (err) => console.error('Erreur chargement sujet:', err)
    });
  }

  postuler(): void {
    if (!this.typeEntretien || !this.sujet?.id) return;

    if (!this.candidateId) {
      console.error('Candidat non connecté');
      return;
    }

    this.loading = true;
    this.isSubmitting = true;
    this.analysisResult = null;
    this.errorMessage = '';

    this.candidatureService.postuler(
      this.sujet.id,
      this.candidateId,
      this.typeEntretien
    ).subscribe({
      next: (result) => {
        this.loading = false;
        this.isSubmitting = false;
        this.analysisResult = result;
        this.submitted = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.isSubmitting = false;
        if (err.status === 409) {
          this.errorMessage = '⚠️ Vous avez déjà postulé sur ce sujet !';
        } else {
          this.errorMessage = err.error || 'Erreur lors de la candidature.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}