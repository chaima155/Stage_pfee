import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrls: ['./login.css'],
})
export class LoginComponent {
    loginForm!: FormGroup;
    isSubmitting = false;
    errorMessage = '';

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

    onSubmit() {
        if (this.loginForm.invalid) {
            Object.values(this.loginForm.controls).forEach(c => c.markAsTouched());
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        const { email, motDePasse } = this.loginForm.value;

        this.authService.login(email, motDePasse).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.router.navigate(['/my-space']);
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect';
            }
        });
    }
}
