import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SujetStageService } from '../../services/sujet-stage';
import { SujetStage } from '../../model/sujet-stage';

@Component({
  selector: 'app-sujet-stage-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sujet-stage-create.html',
  styleUrls: ['./sujet-stage-create.css'],
})
export class SujetStageCreate {
  sujet: SujetStage = {
      titre: '',
      description: '',
      motsCles: '',
      nbrStagiaires: 1,      // Changé de 0 à 1 (plus logique)
      niveau: '',
      duree: 6,               // Changé de 0 à 6 (valeur par défaut)
      technologies: ''
    };

    showSuccessMessage: boolean = false;
    submitAttempted: boolean = false;

    constructor(
      private sujetService: SujetStageService,
      private router: Router
    ) {}

    saveSujet(): void {
      this.submitAttempted = true;

      // Vérification simple des champs obligatoires
      if (!this.sujet.titre || !this.sujet.description) {
        console.warn('Champs obligatoires manquants');
        return;
      }

      this.sujetService.addSujet(this.sujet).subscribe({
        next: () => {
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.router.navigate(['dashbord/list']);
          });
        },
        error: (err) => console.error('Erreur lors de l\'enregistrement', err)
      });
    }

    // Méthode pour réinitialiser le formulaire
    resetForm(): void {
      this.sujet = {
        titre: '',
        description: '',
        motsCles: '',
        nbrStagiaires: 1,
        niveau: '',
        duree: 6,
        technologies: ''
      };
      this.submitAttempted = false;
    }

    // Méthode pour afficher les technologies sous forme de tags
    getTechnologiesList(): string[] {
      if (this.sujet.technologies) {
        return this.sujet.technologies
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0);
      }
      return []; 
    }

    // Vérification des champs obligatoires
    isFieldInvalid(fieldName: string): boolean {
      if (!this.submitAttempted) return false;

      switch(fieldName) {
        case 'titre':
          return !this.sujet.titre;
        case 'description':
          return !this.sujet.description;
        default:
          return false;
      }
    }
}
