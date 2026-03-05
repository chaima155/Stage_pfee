import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(private router: Router){}
  goToCreate(): void {
        this.router.navigate(['dashbord/create']);
        }
  goToList(): void {
        this.router.navigate(['dashbord/list']);
        }
  goToCreateEntretien(): void {
        this.router.navigate(['dashbord/entretien/create']);
        }

}
