// entretien-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EntretienService } from '../../services/entretien';
import { SujetStageService } from '../../services/sujet-stage';
import { SujetStage } from '../../model/sujet-stage';

@Component({
  selector: 'app-entretien-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    private sujetService: SujetStageService
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
      },
      error: (err) => {
        console.error('❌ Erreur chargement sujets:', err);
        this.errorSujets = 'Impossible de charger la liste des sujets';
        this.loadingSujets = false;
      }
    });
  }

  saveEntretien(form: NgForm) {
    if (form.valid) {
      if (!this.entretien.sujetStageId) {
        alert('Veuillez sélectionner un sujet');
        return;
      }

      // FORMATAGE POUR JAVA.UTIL.DATE
      const entretienData = {
        // Convertir la date au format attendu par Java Date
        date: this.formatDateForJava(this.entretien.date),
        sujetStage: { id: this.entretien.sujetStageId }
      };

      console.log('📤 Données envoyées au backend:', entretienData);

      this.entretienService.addentretien(entretienData).subscribe({
        next: (response) => {
          console.log('✅ Entretien ajouté:', response);
          alert('Entretien ajouté avec succès !');
          form.resetForm();
          this.entretien = {
            date: '',
            sujetStageId: null
          };
        },
        error: (err) => {
          console.error('❌ Erreur détaillée:', err);
          alert('Erreur lors de l\'ajout de l\'entretien.');
        }
      });
    }
  }

  // Méthode pour formater la date pour java.util.Date
  private formatDateForJava(dateString: string): string {
    if (!dateString) return '';
    
    // Créer un objet Date à partir du string
    const date = new Date(dateString);
    
    // Format pour java.util.Date (ISO 8601)
    // Exemple: 2024-01-15T14:30:00.000+00:00
    return date.toISOString(); // Format: 2024-01-15T14:30:00.000Z
  }

  // Option 2: Format spécifique si nécessaire
  private formatDateForJavaAlternative(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Format: 2024-01-15 14:30:00
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  retryLoadSujets(): void {
    this.loadSujets();
  }
}