import { Component } from '@angular/core';
import { SujetStageService } from '../../services/sujet-stage';
import { SujetStage } from '../../model/sujet-stage';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sujet-stage-edite',
  imports: [],
  templateUrl: './sujet-stage-edite.html',
  styleUrls: ['./sujet-stage-edite.css'],
})
export class SujetStageEdite {
   sujet: SujetStage = {
    id: 0,
    titre: '',
    description: '',
    motsCles: '',
    nbrStagiaires: 0,
    niveau: '',
    duree: 0,
    technologies: '',
    dateposte: ''
  };

  constructor(
    private sujetService: SujetStageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'id depuis l'URL
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sujet.id = id;

    // Charger les données actuelles pour pré-remplir le formulaire
    
  }

  // Formater la date pour l'input type="date" (string YYYY-MM-DD)
  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  updateSujet(): void {
    this.sujetService.updateSujet(this.sujet.id!, this.sujet).subscribe({
      next: (res) => {
        console.log('Mise à jour réussie', res);
        this.router.navigate(['/sujets']); // retour à la liste après update
      },
      error: (err) => console.error('Erreur mise à jour', err)
    });
  }
}
