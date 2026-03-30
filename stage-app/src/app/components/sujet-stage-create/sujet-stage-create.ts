// src/app/components/sujet-stage-create/sujet-stage-create.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SujetStageService } from '../../services/sujet-stage';
import { SujetStage } from '../../models/sujet-stage';

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
    nbrStagiaires: 1,
    niveau: '',
    duree: 6,
    technologies: ''
  };

  showSuccessMessage: boolean = false;
  submitAttempted: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private sujetService: SujetStageService,
    private router: Router
  ) {}

  saveSujet(): void {
    this.submitAttempted = true;
    this.errorMessage = '';
    this.isLoading = true;

    // Validation
    if (!this.sujet.titre || !this.sujet.titre.trim()) {
      this.errorMessage = 'Le titre est obligatoire';
      this.isLoading = false;
      return;
    }

    if (!this.sujet.description || !this.sujet.description.trim()) {
      this.errorMessage = 'La description est obligatoire';
      this.isLoading = false;
      return;
    }

    // Préparer les données
    const sujetData = {
      ...this.sujet,
      statut: 'DISPONIBLE',
      dateCreation: new Date()
    };

    console.log('📤 Envoi du sujet:', sujetData);

    this.sujetService.addSujet(sujetData).subscribe({
      next: (response) => {
        console.log('✅ Sujet créé avec succès:', response);
        this.showSuccessMessage = true;
        this.isLoading = false;
        
        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/dashbord/list']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la création:', err);
        this.errorMessage = err.message || 'Erreur lors de la création du sujet';
        this.isLoading = false;
      }
    });
  }

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
    this.errorMessage = '';
    this.showSuccessMessage = false;
  }

  getTechnologiesList(): string[] {
    if (this.sujet.technologies) {
      return this.sujet.technologies
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
    }
    return [];
  }

  isFieldInvalid(fieldName: string): boolean {
    if (!this.submitAttempted) return false;

    switch(fieldName) {
      case 'titre':
        return !this.sujet.titre || !this.sujet.titre.trim();
      case 'description':
        return !this.sujet.description || !this.sujet.description.trim();
      default:
        return false;
    }
  }
}
