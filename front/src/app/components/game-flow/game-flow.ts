import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SessionService, SessionStateResponse } from '../../services/session.service';
import { GameStateService } from '../../services/game-state.service';
import { TriGame } from '../tri-game/tri-game';
import { SequenceGame } from '../sequence-game/sequence-game';
import { QuizGame } from '../quiz-game/quiz-game';
import { SafeGame } from '../safe-game/safe-game';

/**
 * Orchestrateur principal du jeu.
 * Charge l'état de la session, affiche la progression et route vers le mini-jeu actif.
 */
@Component({
  selector: 'app-game-flow',
  imports: [CommonModule, TriGame, SequenceGame, QuizGame, SafeGame],
  templateUrl: './game-flow.html',
  styleUrl: './game-flow.css'
})
export class GameFlow implements OnInit, OnDestroy {
  sessionId: number | null = null;
  pseudo = '';
  session: SessionStateResponse | null = null;
  error = '';
  showingFragmentUnlock = false;
  isFirstLoad = true;

  // Pour arrêter le polling proprement
  private pollSub?: Subscription;

  constructor(
    private sessionService: SessionService,
    private gameState: GameStateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sessionId = this.gameState.getSessionId();
    this.pseudo = this.gameState.getPseudo();

    if (!this.sessionId) {
      this.router.navigate(['/']);
      return;
    }

    this.loadState();

    // Polling toutes les 4 secondes pour suivre l'état de la session
    this.pollSub = interval(4000)
      .pipe(switchMap(() => this.sessionService.getState(this.sessionId!)))
      .subscribe({
        next: (data) => {
          this.session = data;
          // Si la session est expirée, redirige vers la défaite
          if (data.sessionExpiree) {
            this.gameState.setGameResult({ session: data, finalCode: '' });
            this.router.navigate(['/defeat']);
          }
        },
        error: (err) => {
          this.error = err.message;
        }
      });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  /** Charge l'état de la session une fois. */
  loadState() {
    if (!this.sessionId) return;
    this.error = '';

    this.sessionService.getState(this.sessionId).subscribe({
      next: (data) => {
        const previousDone = this.session ? this.getDoneCount() : 0;
        this.session = data;
        const currentDone = this.getDoneCount();

        // Détecte si un nouveau mini-jeu vient d'être terminé
        if (!this.isFirstLoad && currentDone > previousDone) {
          this.showingFragmentUnlock = true;
        }
        this.isFirstLoad = false;

        if (data.sessionExpiree) {
          this.gameState.setGameResult({ session: data, finalCode: '' });
          this.router.navigate(['/defeat']);
        }
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  /** Appelé quand un mini-jeu est terminé : recharge l'état. */
  onMiniGameComplete() {
    this.loadState();
  }

  /** Appelé quand un mini-jeu est perdu : redirige vers la défaite. */
  onMiniGameDefeat() {
    this.onDefeat();
  }

  /** Passe à la suite après l'affichage du fragment débloqué. */
  continueToNextGame() {
    this.showingFragmentUnlock = false;
  }

  /** Redirige vers la page de victoire. */
  onVictory() {
    this.gameState.setGameResult({ session: this.session, finalCode: this.getFullCode() });
    this.router.navigate(['/victory']);
  }

  /** Redirige vers la page de défaite. */
  onDefeat() {
    this.gameState.setGameResult({ session: this.session, finalCode: this.getFullCode() });
    this.router.navigate(['/defeat']);
  }

  /** Trie les suivis par ordre croissant. */
  getOrderedSuivis() {
    return (this.session?.suivis ?? []).slice().sort((a, b) => a.ordre - b.ordre);
  }

  /** Calcule le nombre de mini-jeux terminés. */
  getDoneCount(): number {
    return this.getOrderedSuivis().filter((s) => s.termine).length;
  }

  /** Calcule le pourcentage de progression. */
  getProgress(): number {
    const suivis = this.getOrderedSuivis();
    if (!suivis.length) return 0;
    return (this.getDoneCount() / suivis.length) * 100;
  }

  /** Retourne le prochain mini-jeu à jouer (le premier non terminé). */
  getProchain() {
    return this.getOrderedSuivis().find((s) => !s.termine);
  }

  /** Retourne les fragments de code selon l'état de validation. */
  getFragments(): string[] {
    const suivis = this.getOrderedSuivis();
    const inventaires = this.session?.inventaireCodes ?? [];

    return suivis.map((s, index) => {
      if (!s.termine) return '????';
      // Cherche le fragment correspondant à l'ordre du mini-jeu
      const inv = inventaires.find(
        (i) => i.code?.ordre === s.ordre && i.estValide
      );
      return inv?.code?.fragment ?? '????';
    });
  }

  /** Retourne le dernier fragment débloqué. */
  getLastUnlockedFragment(): string {
    const fragments = this.getFragments();
    const done = this.getDoneCount();
    if (done > 0 && fragments[done - 1] !== '????') {
      return fragments[done - 1];
    }
    return '????';
  }

  /** Assemble les fragments pour former le code complet. */
  getFullCode(): string {
    return this.getFragments().join('');
  }
}
