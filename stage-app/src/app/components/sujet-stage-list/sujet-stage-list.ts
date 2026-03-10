import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SujetStageService } from '../../services/sujet-stage';
import { SujetStage } from '../../models/sujet-stage';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sujet-stage-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sujet-stage-list.html',
  styleUrls: ['./sujet-stage-list.css']
})
export class SujetStageList implements OnInit, OnDestroy {
  sujets: SujetStage[] = [];
  loading: boolean = false;
  error: string | null = null;
  private routerSub!: Subscription;

  constructor(
    private sujetService: SujetStageService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ✅ Ajouter
  ) {}

  ngOnInit(): void {
    this.loadSujets();

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadSujets();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  loadSujets(): void {
    this.loading = true;
    this.cdr.detectChanges(); // ✅ Forcer la détection après loading = true

    this.sujetService.getSujets().subscribe({
      next: (data) => {
        this.sujets = data;
        this.loading = false;
        this.cdr.detectChanges(); // ✅ Forcer la détection après réception des données
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Impossible de charger les sujets.';
        this.loading = false;
        this.cdr.detectChanges(); // ✅ Forcer la détection après erreur
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/dashbord/create']);
  }

  refreshList(): void {
    this.loadSujets();
  }

  // ✅ Ajouter dans sujet-stage-list.ts
editSujet(id: number): void {
  this.router.navigate(['/dashbord/edite', id]);
}

deleteSujet(id: number): void {
  if (confirm('Voulez-vous vraiment supprimer ce sujet ?')) {
    this.sujetService.deleteSujet(id).subscribe({
      next: () => {
        console.log('✅ Sujet supprimé');
        this.loadSujets(); // ✅ Recharger la liste
      },
      error: (err) => console.error('❌ Erreur suppression', err)
    });
  }
}
}