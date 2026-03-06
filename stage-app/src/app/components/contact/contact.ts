import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisService } from '../../services/avis.service'; // ✅ check this path

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  encapsulation: ViewEncapsulation.None
})
export class Contact {
  rating = 0;
  nom = '';
  avisText = '';

  constructor(private avisService: AvisService) {} // ✅ must be here

  get avisList() { return this.avisService.avisList; }

  setRating(value: number) { this.rating = value; }
successMessage = '';
  submitAvis() {
    console.log('nom:', this.nom);
    console.log('avisText:', this.avisText);
    console.log('rating:', this.rating);

    if (!this.nom || !this.avisText || this.rating === 0) {
      console.log('BLOCKED: missing fields');
      return;
    }
    
    this.avisService.addAvis(this.nom, this.avisText, this.rating);
    this.nom = '';
    this.avisText = '';
    this.rating = 0;
    this.successMessage = 'Votre avis a été soumis avec succès !'; // ✅
  setTimeout(() => this.successMessage = '', 4000); 
  }
}