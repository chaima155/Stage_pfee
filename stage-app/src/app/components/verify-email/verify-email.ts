// verify-email.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verify-container">
      <div class="verify-card" *ngIf="status === 'loading'">
        <div class="spinner"></div>
        <p>Vérification en cours...</p>
      </div>
      <div class="verify-card success" *ngIf="status === 'success'">
        <div class="icon">✅</div>
        <h2>Email vérifié !</h2>
        <p>Votre compte est activé. Vous pouvez maintenant vous connecter.</p>
        <button (click)="router.navigate(['/login'])">Se connecter</button>
      </div>
      <div class="verify-card error" *ngIf="status === 'error'">
        <div class="icon">❌</div>
        <h2>Lien invalide</h2>
        <p>Ce lien est invalide ou a expiré.</p>
        <button (click)="router.navigate(['/register-candidate'])">S'inscrire à nouveau</button>
      </div>
    </div>
  `,
  styles: [`
    .verify-container {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f0f2f7;
    }
    .verify-card {
      background: white; border-radius: 20px; padding: 48px;
      text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      max-width: 400px; width: 90%;
    }
    .icon { font-size: 56px; margin-bottom: 16px; }
    h2 { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
    p { color: #666; margin-bottom: 24px; }
    button {
      padding: 12px 28px; background: #3b5bdb; color: white;
      border: none; border-radius: 10px; font-size: 15px;
      font-weight: 600; cursor: pointer;
    }
    .spinner {
      width: 40px; height: 40px; border: 4px solid #e2e8f0;
      border-top-color: #3b5bdb; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class VerifyEmailComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status = 'error';
      return;
    }

    this.http.get(`http://localhost:8081/api/candidates/verify-email?token=${token}`)
      .subscribe({
        next: () => {
  this.status = 'success';
  setTimeout(() => this.router.navigate(['/login']), 3000);
},
        error: () => this.status = 'error'
      });
  }
}