import { Component, signal } from '@angular/core';
import { RouterOutlet , Router, NavigationEnd  } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, CommonModule],
  template: `
    <app-header *ngIf="!isDashboard"></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer *ngIf="!isDashboard"></app-footer>
  `,
  styles: [`
    main {
      padding: 16px;
    }
  `],
})export class App {
  protected readonly title = signal('stage-app');
  isDashboard = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isDashboard = event.url.startsWith('/dashbord');
    });
  }
}