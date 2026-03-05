import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';  // ✅ Ajouter
import { EntretienService } from '../../services/entretien';
import { SujetStageService } from '../../services/sujet-stage';
import { SujetStage } from '../../model/sujet-stage';

@Component({
  selector: 'app-entretien-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],  // ✅ Ajouter RouterModule
  templateUrl: './entretien-create.html',
  styleUrls: ['./entretien-create.css'],
})
export class EntretienCreate implements OnInit {
  entretien: any = {
    date: '',
    sujetStageId: null
  };

  sujets: SujetStage[] = [];
  loadingSujets: boolean = true;
  errorSujets: string | null = null;

  constructor(
    private entretienService: EntretienService,
    private sujetService: SujetStageService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ✅ Ajouter
  ) {}

  ngOnInit(): void {
    this.loadSujets();
  }

  loadSujets(): void {
    this.loadingSujets = true;
    this.errorSujets = null;

    this.sujetService.getSujets().subscribe({
      next: (data) => {
        console.log('✅ Sujets chargés:', data);
        this.sujets = data;
        this.loadingSujets = false;
        this.cdr.detectChanges();  // ✅ Forcer le rafraîchissement
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.errorSujets = 'Impossible de charger la liste des sujets';
        this.loadingSujets = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveEntretien(form: NgForm) {
    if (form.valid) {
      if (!this.entretien.sujetStageId) {
        alert('Veuillez sélectionner un sujet');
        return;
      }

      const entretienData = {
        date: new Date(this.entretien.date).toISOString(),
        sujetStage: { id: this.entretien.sujetStageId }
      };

      console.log('📤 Données envoyées:', entretienData);

      this.entretienService.addentretien(entretienData).subscribe({
        next: (response) => {
          console.log('✅ Entretien ajouté:', response);
          // ✅ Redirection vers la liste après enregistrement
          this.router.navigate(['/dashbord/list']);
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          alert('Erreur lors de l\'ajout de l\'entretien.');
        }
      });
    }
  }
}