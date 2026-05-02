import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';

/**
 * Composant de la page d'introduction (briefing avant la mission).
 *
 * GameIntro sert d'écran de briefing entre la connexion du joueur
 * et le début effectif des mini-jeux. Cette page :
 *
 * **Fonctionnalités :**
 * - Affiche le code PIN de la session (rappel visuel)
 * - Affiche le pseudo du joueur pour personnaliser l'expérience
 * - Présente les objectifs de la mission (3 mini-jeux à compléter)
 * - Montre les fragments de code à récupérer (état initial : "????")
 * - Bouton "Lancer la mission" pour démarrer le jeu
 *
 * **Navigation :**
 * - Accessible après avoir rejoint une session (JoinSession)
 * - Redirige vers GameFlow au démarrage du jeu
 *
 * **Données :**
 * - Récupère sessionPin et pseudo depuis GameStateService
 * - Ces données ont été stockées lors du joinSession()
 */
@Component({
  selector: 'app-game-intro',
  imports: [CommonModule],
  templateUrl: './game-intro.html',
  styleUrl: './game-intro.css'
})
export class GameIntro implements OnInit {
  /** Code PIN de la session (affiché pour rappel). */
  sessionPin = '';

  /** Pseudo du joueur (affiché dans le briefing). */
  pseudo = '';

  /**
   * Crée une instance du composant GameIntro.
   *
   * @param gameState - Service pour récupérer les données de session (PIN, pseudo)
   * @param router - Routeur Angular pour la navigation vers GameFlow
   */
  constructor(
    private gameState: GameStateService,
    private router: Router
  ) {}

  /**
   * Initialisation du composant au chargement.
   *
   * Cette méthode du cycle de vie Angular récupère :
   * - Le code PIN de la session depuis GameStateService
   * - Le pseudo du joueur depuis GameStateService
   *
   * Ces données ont été stockées lors de la jointure à la session
   * via JoinSession et sont nécessaires pour afficher le briefing.
   *
   * @implements OnInit
   */
  ngOnInit() {
    // Récupère les données depuis l'état global au chargement du composant
    this.sessionPin = this.gameState.getSessionPin();
    this.pseudo = this.gameState.getPseudo();
  }

  /**
   * Démarre la mission et redirige vers la page de jeu (GameFlow).
   *
   * Cette méthode est appelée lorsque le joueur clique sur
   * "Lancer la mission". Elle navigue vers la route '/game'
   * où le composant GameFlow chargera l'état de la session
   * et affichera le premier mini-jeu.
   *
   * @example
   * // Dans le template
   * <button (click)="startGame()">Lancer la mission</button>
   */
  startGame() {
    this.router.navigate(['/game']);
  }
}
