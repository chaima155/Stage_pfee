import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SujetStageService } from '../../services/sujet-stage';
import { SujetStage } from '../../models/sujet-stage';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sujet-stage-edite',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Ajouter CommonModule et FormsModule
  templateUrl: './sujet-stage-edite.html',
  styleUrls: ['./sujet-stage-edite.css'],
})
export class SujetStageEdite implements OnInit {
  sujet: SujetStage = {
    id: 0,
    titre: '',
    description: '',
    motsCles: '',
    nbrStagiaires: 1,
    niveau: '',
    duree: 6,
    technologies: '',
  };

  submitAttempted: boolean = false;
  showSuccessMessage: boolean = false;

  constructor(
    private sujetService: SujetStageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Récupérer l'id depuis l'URL
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // ✅ Charger les données actuelles pour pré-remplir le formulaire
    this.sujetService.getSujetById(id).subscribe({
      next: (data) => {
        this.sujet = data;
        console.log('✅ Sujet chargé:', data);
      },
      error: (err) => console.error('❌ Erreur chargement sujet', err)
    });
  }

  updateSujet(): void {
    this.submitAttempted = true;

    if (!this.sujet.titre || !this.sujet.description) {
      console.warn('Champs obligatoires manquants');
      return;
    }

    this.sujetService.updateSujet(this.sujet.id!, this.sujet).subscribe({
      next: () => {
        console.log('✅ Mise à jour réussie');
        // ✅ Navigation correcte vers la liste
        this.router.navigate(['/dashbord/list']);
      },
      error: (err) => console.error('❌ Erreur mise à jour', err)
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    if (!this.submitAttempted) return false;
    switch (fieldName) {
      case 'titre': return !this.sujet.titre;
      case 'description': return !this.sujet.description;
      default: return false;
    }
  }

  cancelEdit(): void {
    this.router.navigate(['/dashbord/list']);
  }
}