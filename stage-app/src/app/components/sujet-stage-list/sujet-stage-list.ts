import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SujetStageService } from '../../services/sujet-stage';
import { SujetStage } from '../../model/sujet-stage';

@Component({
  selector: 'app-sujet-stage-list',
  standalone: true,
  imports: [CommonModule, RouterModule],  // RouterModule pour routerLink
  templateUrl: './sujet-stage-list.html',
  styleUrls: ['./sujet-stage-list.css']
})
export class SujetStageList implements OnInit {
  sujets: SujetStage[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private sujetService: SujetStageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSujets();
    this.sujetService.getSujets().subscribe((data: any[]) => {
    this.sujets = data; // cette liste doit contenir des objets {id, titre}
    console.log(this.sujets); // <- vérifie ce qui arrive du backend
  });
  }

  /**
   * Charge tous les sujets depuis le service
   */
  loadSujets(): void {
    this.loading = true;
    this.error = null;
    
    this.sujetService.getSujets().subscribe({
      next: (data) => {
        console.log('✅ Données reçues:', data);
        this.sujets = data;
        this.loading = false;
      }
    });
  }

  /**
   * Navigation vers la page de création
   */
  goToCreate(): void {
    this.router.navigate(['dashbord/create']);
  }

  /**
   * Rafraîchir la liste
   */
  refreshList(): void {
    this.loadSujets();
  }

  
}