import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Candidate } from '../../models/candidate';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  currentUser: Candidate | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges();
    });
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
  showLogoutModal = false;

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  getPhotoUrl(): string {
    if (this.currentUser?.photo) {
      return this.authService.getPhotoUrl(this.currentUser.photo);
    }
    return '';
  }

  hasPhoto(): boolean {
    return !!this.currentUser?.photo;
  }

  getInitials(): string {
    if (!this.currentUser) return '?';
    const first = this.currentUser.prenom?.charAt(0) || '';
    const last = this.currentUser.nom?.charAt(0) || '';
    return (first + last).toUpperCase();
  }


}