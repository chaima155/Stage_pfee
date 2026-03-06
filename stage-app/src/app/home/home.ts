import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisService } from '../services/avis.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private avisService: AvisService) {}
  get avisList() { return this.avisService.avisList; }
}