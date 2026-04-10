import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  responsableNom: string = 'Responsable';
  responsablePhoto: string | null = null;
  responsableInitiale: string = 'R';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      this.responsableNom = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Responsable';
      this.responsableInitiale = (user.prenom?.[0] || user.nom?.[0] || 'R').toUpperCase();
      if (user.photo) {
        this.responsablePhoto = `http://localhost:8081/api/responsables/photos/${user.photo.split('/').pop()}`;
      }
    }
  }

  goToCreate(): void { this.router.navigate(['dashbord/create']); }
  goToList(): void { this.router.navigate(['dashbord/list']); }
  goToCreateEntretien(): void { this.router.navigate(['dashbord/entretien/create']); }
  goToListentretien(): void { this.router.navigate(['/dashbord/entretien/list']); }
  goToListcandidature(): void { this.router.navigate(['/dashbord/candidature/list']); }
  goToResponsableEdit(): void { this.router.navigate(['/dashbord/responsable-edite']); }
}