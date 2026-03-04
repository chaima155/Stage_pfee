import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../models/candidate';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidate-form.html',
  styleUrls: ['./candidate-form.css'],
})
export class CandidateFormComponent {

  candidateForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private router: Router
  ) {
    this.createForm();
  }

  createForm() {
    this.candidateForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', Validators.required],
      sexes: ['', Validators.required],
      universite: ['', Validators.required],
      diplome: ['', Validators.required],
      anneeDiplome: ['', Validators.required],
      informations: [''],
      dateNaissance: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      paysResidence: ['', Validators.required]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Format invalide. PDF, DOC, DOCX uniquement.';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
      console.log('File selected:', file.name);
    }
  }

  onSubmit() {
    console.log('=== SUBMIT CALLED ===');
    console.log('Form valid:', this.candidateForm.valid);
    console.log('Form values:', this.candidateForm.value);
    Object.keys(this.candidateForm.controls).forEach(key => {
      const control = this.candidateForm.get(key);
      if (control?.invalid) {
        console.log('INVALID FIELD:', key, control.errors);
      }
    });

    if (this.candidateForm.invalid) {
      this.markFormGroupTouched(this.candidateForm);
      console.log('STOPPED: form invalid');
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const candidateData: Candidate = this.candidateForm.value;

    this.candidateService
      .registerCandidate(candidateData, this.selectedFile || undefined)
      .subscribe({
        next: (response) => {
          console.log('SUCCESS:', response);
          this.isSubmitting = false;
          this.successMessage = 'Candidature enregistrée avec succès ! Redirection...';
          this.candidateForm.reset();
          this.selectedFile = null;
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          console.log('ERROR:', err);
          this.isSubmitting = false;
          if (err.status === 409) {
            this.errorMessage = 'Cette adresse email est déjà utilisée.'; // ✅
          } else {
            this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.'; // ✅
          }
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}