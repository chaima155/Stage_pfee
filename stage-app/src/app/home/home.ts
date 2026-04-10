import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisService } from '../services/avis.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private avisService: AvisService,private router: Router) {}
  get avisList() { return this.avisService.avisList; }
  goToCreate():void{
    this.router.navigate(['register-candidate']);
  }
  goToStage():void{
    this.router.navigate(['stages']);
  }
}