import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { GameStateService } from './services/game-state.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  headerSubtitle = signal('Escape game cosmétique');

  constructor(
    private router: Router,
    private gameState: GameStateService,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSubtitle(event.urlAfterRedirects);
      });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.gameState.reset();
        this.router.navigate(['/']);
      },
      error: () => {
        this.gameState.reset();
        this.router.navigate(['/']);
      }
    });
  }

  get currentUrl(): string {
    return this.router.url;
  }

  get headerBtnLabel(): string {
    return this.router.url.includes('admin-dashboard') ? 'Déconnexion' : 'Retour';
  }

  handleHeaderAction() {
    if (this.router.url.includes('admin-dashboard')) {
      this.logout();
    } else {
      this.goHome();
    }
  }

  private updateSubtitle(url: string) {
    if (url.includes('admin-login')) {
      this.headerSubtitle.set('Connexion administrateur');
    } else if (url.includes('admin-dashboard')) {
      this.headerSubtitle.set('Gestion de session et suivi des mini-jeux');
    } else if (url.includes('join')) {
      this.headerSubtitle.set('Rejoindre une session avec un code PIN');
    } else if (url.includes('intro')) {
      this.headerSubtitle.set('Briefing avant de commencer la mission');
    } else if (url.includes('game')) {
      this.headerSubtitle.set("Progression de l'escape game");
    } else if (url.includes('victory')) {
      this.headerSubtitle.set('Mission accomplie');
    } else if (url.includes('defeat')) {
      this.headerSubtitle.set('Mission échouée');
    } else {
      this.headerSubtitle.set('Escape game cosmétique');
    }
  }
}
