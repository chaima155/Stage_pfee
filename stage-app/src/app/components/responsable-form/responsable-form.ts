import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-responsable-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './responsable-form.html',
  styleUrl: './responsable-form.css',
})
export class ResponsableForm {
  form!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', Validators.required]
    });
  }

  // responsable-form.component.ts
onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.isSubmitting = true;
  this.errorMessage = '';

  this.http.post<any>('http://localhost:8081/api/responsables/login', this.form.value)
    .subscribe({
      next: (response) => {
        this.isSubmitting = false;

        // ✅ FIX 1: Nettoyer toute session précédente
        localStorage.clear();

        // ✅ FIX 2: Clé DÉDIÉE pour le responsable, pas 'user'
        localStorage.setItem('currentResponsable', JSON.stringify(response));
        localStorage.setItem('responsableToken', response.token || '');
        localStorage.setItem('userRole', 'responsable');

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.status === 401
          ? 'Email ou mot de passe incorrect.'
          : 'Une erreur est survenue.';
      }
    });
}
} 