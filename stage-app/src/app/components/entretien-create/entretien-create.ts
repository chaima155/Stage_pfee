import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { EntretienService } from '../../services/entretien';

@Component({
  selector: 'app-entretien-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './entretien-create.html',
  styleUrls: ['./entretien-create.css'],
})
export class EntretienCreate implements OnInit {
  entretien: any = {
    date: ''
  };

  constructor(
    private entretienService: EntretienService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  saveEntretien(form: NgForm) {
    if (form.valid) {
      const entretienData = {
        date: new Date(this.entretien.date).toISOString()
        // ✅ Plus de sujetStage
      };

      this.entretienService.addentretien(entretienData).subscribe({
        next: (response) => {
          console.log('✅ Entretien ajouté:', response);
          this.router.navigate(['//dashbord/entretien/list']);
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          alert('Erreur lors de l\'ajout de l\'entretien.');
        }
      });
    }
  }
}