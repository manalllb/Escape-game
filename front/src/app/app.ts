import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { GameStateService } from './services/game-state.service';
import { AuthService } from './services/auth.service';

/**
 * Composant racine de l'application.
 * Affiche la barre d'en-tête commune et le contenu de la page active via le routeur.
 */
@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Signal réactif pour le sous-titre affiché dans l'en-tête
  headerSubtitle = signal('Escape game cosmétique');

  constructor(
    private router: Router,
    private gameState: GameStateService,
    private authService: AuthService
  ) {
    // Met à jour le sous-titre à chaque changement de route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSubtitle(event.urlAfterRedirects);
      });
  }

  /** Retourne à la page d'accueil. */
  goHome() {
    this.router.navigate(['/']);
  }

  /** Déconnecte l'utilisateur (backend + local) et retourne à l'accueil. */
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.gameState.reset();
        this.router.navigate(['/']);
      },
      error: () => {
        // En cas d'erreur réseau, on nettoie quand même localement
        this.gameState.reset();
        this.router.navigate(['/']);
      }
    });
  }

  /** Expose l'URL courante pour le template. */
  get currentUrl(): string {
    return this.router.url;
  }

  /** Label du bouton header selon la route. */
  get headerBtnLabel(): string {
    return this.router.url.includes('admin-dashboard') ? 'Déconnexion' : 'Retour';
  }

  /** Action du bouton header selon la route. */
  handleHeaderAction() {
    if (this.router.url.includes('admin-dashboard')) {
      this.logout();
    } else {
      this.goHome();
    }
  }

  /**
   * Met à jour le sous-titre selon la route active.
   * Cela permet d'afficher un texte descriptif dans l'en-tête.
   */
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
