import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';

/**
 * Composant de la page d'accueil (WelcomePage).
 *
 * WelcomePage est la page d'entrée de l'application Escape Game.
 * Elle permet à l'utilisateur de choisir son rôle :
 *
 * **Rôle Joueur :**
 * - Redirige vers JoinSession pour rejoindre une session avec un code PIN
 * - Pour les élèves/participants qui veulent jouer
 *
 * **Rôle Administrateur :**
 * - Redirige vers AdminLogin pour s'authentifier
 * - Pour les professeurs/gestionnaires qui créent et suivent les sessions
 *
 * **Fonctionnalités :**
 * - Deux cartes distinctes avec icônes et descriptions
 * - Navigation intuitive vers les flux appropriés
 * - Réinitialisation des erreurs avant navigation
 *
 * **Navigation :**
 * - Point d'entrée principal de l'application (route '/')
 * - Première page affichée au chargement de l'application
 */
@Component({
  selector: 'app-welcome-page',
  imports: [CommonModule],
  templateUrl: './welcome-page.html',
  styleUrl: './welcome-page.css'
})
export class WelcomePage {
  /**
   * Crée une instance du composant WelcomePage.
   *
   * @param router - Routeur Angular pour la navigation vers les pages de rôle
   * @param gameState - Service pour réinitialiser les erreurs avant navigation
   */
  constructor(
    private router: Router,
    private gameState: GameStateService
  ) {}

  /**
   * Redirige vers la page de connexion administrateur.
   *
   * Cette méthode est appelée lorsque l'utilisateur clique sur
   * "Accès Admin". Elle :
   * 1. Réinitialise le message d'erreur global
   * 2. Navigue vers la route '/admin-login'
   *
   * @example
   * // Dans le template
   * <button (click)="goAdmin()">Accès Admin</button>
   */
  goAdmin() {
    // Réinitialise les erreurs avant navigation
    this.gameState.setError('');
    this.router.navigate(['/admin-login']);
  }

  /**
   * Redirige vers la page de rejoint de session (joueur).
   *
   * Cette méthode est appelée lorsque l'utilisateur clique sur
   * "Commencer à Jouer". Elle :
   * 1. Réinitialise le message d'erreur global
   * 2. Navigue vers la route '/join'
   *
   * @example
   * // Dans le template
   * <button (click)="goPlayer()">Commencer à Jouer</button>
   */
  goPlayer() {
    // Réinitialise les erreurs avant navigation
    this.gameState.setError('');
    this.router.navigate(['/join']);
  }
}
