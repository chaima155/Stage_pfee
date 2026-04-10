import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SujetStageService } from '../../services/sujet-stage';

@Component({
  selector: 'app-stage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stage.html',
  styleUrl: './stage.css'
})
export class Stage implements OnInit {
  sujets: any[] = [];
  filteredSujets: any[] = [];
  loading = true;

  searchText = '';
  selectedMotsCles: string[] = [];
  selectedTechnologies: string[] = [];

  constructor(
    private sujetService: SujetStageService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sujetService.getSujets().subscribe({
      next: (data) => {
        this.sujets = data;
        this.filteredSujets = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get allMotsCles(): string[] {
    const all = this.sujets.flatMap(s =>
      s.motsCles?.split(',').map((t: string) => t.trim()) ?? []
    );
    return [...new Set(all)].filter(Boolean);
  }

  get allTechnologies(): string[] {
    const all = this.sujets.flatMap(s =>
      s.technologies?.split(',').map((t: string) => t.trim()) ?? []
    );
    return [...new Set(all)].filter(Boolean);
  }

  toggleMotsCle(tag: string): void {
    const i = this.selectedMotsCles.indexOf(tag);
    i === -1 ? this.selectedMotsCles.push(tag) : this.selectedMotsCles.splice(i, 1);
    this.applyFilters();
  }

  toggleTechnology(tech: string): void {
    const i = this.selectedTechnologies.indexOf(tech);
    i === -1 ? this.selectedTechnologies.push(tech) : this.selectedTechnologies.splice(i, 1);
    this.applyFilters();
  }

  applyFilters(): void {
    const text = this.searchText.toLowerCase().trim();

    this.filteredSujets = this.sujets.filter(s => {
      const matchText = !text ||
        s.titre?.toLowerCase().includes(text) ||
        s.entreprise?.toLowerCase().includes(text) ||
        s.description?.toLowerCase().includes(text);

      const tags = s.motsCles?.split(',').map((t: string) => t.trim()) ?? [];
      const matchMots = this.selectedMotsCles.length === 0 ||
        this.selectedMotsCles.every(m => tags.includes(m));

      const techs = s.technologies?.split(',').map((t: string) => t.trim()) ?? [];
      const matchTech = this.selectedTechnologies.length === 0 ||
        this.selectedTechnologies.every(t => techs.includes(t));

      return matchText && matchMots && matchTech;
    });

    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedMotsCles = [];
    this.selectedTechnologies = [];
    this.filteredSujets = [...this.sujets];
    this.cdr.detectChanges();
  }

  postuler(sujetId: number): void {
    const candidateId = localStorage.getItem('candidateId');
    if (!candidateId) {
      localStorage.setItem('redirectSujetId', sujetId.toString());
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/candidature/create', sujetId]);
    }
  }
}