import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css'],
})
export class LoginComponent {
    loginForm!: FormGroup;
    isSubmitting = false;
    errorMessage = '';
    showPassword = false;
    rememberMe = false;
    unverifiedEmail: any;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            motDePasse: ['', Validators.required]
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            Object.values(this.loginForm.controls).forEach(c => c.markAsTouched());
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        const { email, motDePasse } = this.loginForm.value;

        this.authService.login(email, motDePasse).subscribe({
            next: (user: any) => {
                this.isSubmitting = false;

                // Sauvegarder redirectSujetId AVANT le clear
                const redirectSujetId = localStorage.getItem('redirectSujetId');

                // Nettoyer toute session précédente
                localStorage.clear();

                if (user.role === 'responsable_stage') {
                    // Clé dédiée responsable
                    localStorage.setItem('currentResponsable', JSON.stringify(user));
                    localStorage.setItem('responsableToken', user.token || '');
                    localStorage.setItem('userRole', 'responsable');
                    this.router.navigate(['/dashbord']);

                } else if (user.role === 'candidate') {
                    // Clé dédiée candidat
                    localStorage.setItem('currentCandidate', JSON.stringify(user));
                    localStorage.setItem('candidateId', user.id.toString());
                    localStorage.setItem('userRole', 'candidate');

                    if (redirectSujetId) {
                        this.router.navigate(['/candidature/create', redirectSujetId]);
                    } else {
                        this.router.navigate(['/my-space']);
                    }

                } else {
                    this.router.navigate(['/my-space']);
                }
            },
            error: (err) => {
  if (err.status === 403 && err.error?.error === 'EMAIL_NOT_VERIFIED') {
    this.errorMessage = '📧 Veuillez vérifier votre email avant de vous connecter.';
    this.unverifiedEmail = err.error.email; // pour renvoyer l'email
  } else if (err.status === 401) {
    this.errorMessage = 'Email ou mot de passe incorrect.';
  }
}
        });
    }
    
}