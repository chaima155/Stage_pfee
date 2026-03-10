import { Component, OnInit } from '@angular/core';
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

  // ✅ Récupérer candidateId depuis localStorage directement
  candidateId: number = Number(localStorage.getItem('candidateId'));

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private candidatureService: CandidatureService,
    private sujetService: SujetStageService
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
    this.analysisResult = null;

    this.candidatureService.postuler(
      this.sujet.id,
      this.candidateId,
      this.typeEntretien
    ).subscribe({
      next: (result) => {
        this.loading = false;
        this.analysisResult = result;
        this.submitted = true;
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur candidature:', err);
      }
    });
  }
}