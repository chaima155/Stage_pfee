import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit, OnDestroy {
  userName: string = 'Responsable';
  userInitials: string = 'R';
  userRole: string = 'Responsable';
  userPhoto: string = '';

  private storageListener: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Charger au démarrage
    this.loadUserData();

    // ✅ Écouter CHAQUE changement de localStorage (photo, nom, etc.)
    this.storageListener = () => this.loadUserData();
    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  }

  private loadUserData(): void {
    const stored = localStorage.getItem('currentResponsable');
    if (!stored) return;

    const user = JSON.parse(stored);
    const prenom = user.prenom || '';
    const nom    = user.nom    || '';

    this.userName     = `${prenom} ${nom}`.trim() || 'Responsable';
    this.userInitials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || 'R';
    this.userRole     = user.role || 'Responsable';

    if (user.photo) {
      const fileName = user.photo.split('/').pop()?.split('\\').pop();
      // ✅ Cache buster — force le navigateur à recharger la nouvelle photo
      this.userPhoto = `http://localhost:8081/api/responsables/photos/${fileName}?t=${Date.now()}`;
    } else {
      this.userPhoto = '';
    }
  }

  logout(): void {
    localStorage.removeItem('currentResponsable');
    localStorage.removeItem('responsableToken');
    localStorage.removeItem('userRole');
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}