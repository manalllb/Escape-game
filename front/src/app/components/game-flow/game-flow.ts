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

    this.pollSub = interval(4000)
      .pipe(switchMap(() => this.sessionService.getState(this.sessionId!)))
      .subscribe({
        next: (data) => {
          this.session = data;
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

  loadState() {
    if (!this.sessionId) return;
    this.error = '';

    this.sessionService.getState(this.sessionId).subscribe({
      next: (data) => {
        const previousDone = this.session ? this.getDoneCount() : 0;
        this.session = data;
        const currentDone = this.getDoneCount();

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

  onMiniGameComplete() {
    this.loadState();
  }

  onMiniGameDefeat() {
    this.onDefeat();
  }

  continueToNextGame() {
    this.showingFragmentUnlock = false;
  }

  onVictory() {
    this.gameState.setGameResult({ session: this.session, finalCode: this.getFullCode() });
    this.router.navigate(['/victory']);
  }

  onDefeat() {
    this.gameState.setGameResult({ session: this.session, finalCode: this.getFullCode() });
    this.router.navigate(['/defeat']);
  }

  getOrderedSuivis() {
    return (this.session?.suivis ?? []).slice().sort((a, b) => a.ordre - b.ordre);
  }

  getDoneCount(): number {
    return this.getOrderedSuivis().filter((s) => s.termine).length;
  }

  getProgress(): number {
    const suivis = this.getOrderedSuivis();
    if (!suivis.length) return 0;
    return (this.getDoneCount() / suivis.length) * 100;
  }

  getProchain() {
    return this.getOrderedSuivis().find((s) => !s.termine);
  }

  getFragments(): string[] {
    const suivis = this.getOrderedSuivis();
    const inventaires = this.session?.inventaireCodes ?? [];

    return suivis.map((s, index) => {
      if (!s.termine) return '????';
      const inv = inventaires.find(
        (i) => i.code?.ordre === s.ordre && i.estValide
      );
      return inv?.code?.fragment ?? '????';
    });
  }

  getLastUnlockedFragment(): string {
    const fragments = this.getFragments();
    const done = this.getDoneCount();
    if (done > 0 && fragments[done - 1] !== '????') {
      return fragments[done - 1];
    }
    return '????';
  }

  getFullCode(): string {
    return this.getFragments().join('');
  }
}
