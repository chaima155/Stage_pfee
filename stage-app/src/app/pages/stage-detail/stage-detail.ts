import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SujetStageService } from '../../services/sujet-stage';

@Component({
  selector: 'app-stage-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage-detail.html',
  styleUrl: './stage-detail.css'
})
export class StageDetail implements OnInit {
  sujet: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private sujetService: SujetStageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sujetService.getSujetById(id).subscribe({
      next: (data) => {
        this.sujet = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  postuler(): void {
    const candidateId = localStorage.getItem('candidateId');
    if (!candidateId) {
      localStorage.setItem('redirectSujetId', this.sujet.id.toString());
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/candidature/create', this.sujet.id]);
    }
  }
}