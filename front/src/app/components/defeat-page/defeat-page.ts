import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';

/**
 * Composant de la page de défaite.
 *
 * DefeatPage est affiché lorsque le joueur échoue dans sa mission :
 * - Code final incorrect saisi dans le coffre-fort (SafeGame)
 * - Temps écoulé pendant un mini-jeu
 * - Trop d'erreurs dans un mini-jeu
 *
 * Cette page :
 * - Affiche un message d'échec de la mission
 * - Montre le code final attendu pour les tests (aide au développement)
 * - Permet de retourner à l'accueil pour recommencer une partie
 *
 * Les données de résultat (dont le code final) sont récupérées depuis
 * GameStateService où elles ont été stockées par GameFlow lors de la redirection.
 */
@Component({
  selector: 'app-defeat-page',
  imports: [CommonModule],
  templateUrl: './defeat-page.html',
  styleUrl: './defeat-page.css'
})
export class DefeatPage {
  /** Données de résultat transmises depuis GameFlow (code final notamment). */
  result: { finalCode?: string } = {};

  /**
   * Crée une instance du composant DefeatPage.
   *
   * @param gameState - Service pour récupérer les données de résultat du jeu
   * @param router - Routeur Angular pour la navigation vers l'accueil
   */
  constructor(
    private gameState: GameStateService,
    private router: Router
  ) {
    // Récupère les données de résultat stockées dans GameStateService
    this.result = (this.gameState.getGameResult() as typeof this.result) || {};
  }

  /**
   * Réinitialise l'état global et retourne à la page d'accueil.
   *
   * Cette méthode est appelée lorsque le joueur clique sur "Réessayer".
   * Elle :
   * 1. Appelle GameStateService.reset() pour effacer toutes les données
   * 2. Redirige vers la page d'accueil (WelcomePage)
   *
   * @example
   * // Dans le template
   * <button (click)="restart()">Réessayer depuis l'accueil</button>
   */
  restart() {
    this.gameState.reset();
    this.router.navigate(['/']);
  }
}
