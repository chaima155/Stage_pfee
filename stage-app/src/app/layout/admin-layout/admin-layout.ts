import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header} from '../../layout/header/header';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Footer } from '../../layout/footer/footer';
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet,CommonModule,Header,Sidebar,Footer],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  onActivate(): void {
    // ✅ Scroll vers le haut à chaque changement de page
    window.scrollTo(0, 0);
  }

}
